import os
import uuid
import cloudinary
import cloudinary.uploader
import asyncio
import aiohttp
from typing import List
from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from qdrant_client import QdrantClient
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from app.utils import process_pdf
from app.chat import get_answer_with_sources
from app.config import (
    QDRANT_URL, 
    QDRANT_API_KEY, 
    GOOGLE_API_KEY,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET
)

# Configure Cloudinary
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)

app = FastAPI()
sessions = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def periodic_health_check():
    while True:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get("http://localhost:8000/health") as response:
                    if response.status == 200:
                        print("Health check successful")
                    else:
                        print(f"Health check failed with status: {response.status}")
        except Exception as e:
            print(f"Health check error: {str(e)}")
        
        # Wait for 14 minutes (840 seconds)
        await asyncio.sleep(840)

@app.on_event("startup")
async def startup_event():
    # Start the periodic health check
    asyncio.create_task(periodic_health_check())

@app.post("/upload_pdfs/")
async def upload_pdfs(files: List[UploadFile] = File(...)):
    # Check if files were provided
    if not files:
        return JSONResponse(status_code=400, content={"message": "No files provided"})
    
    # Verify all files are PDFs
    for file in files:
        if not file.filename.lower().endswith('.pdf'):
            return JSONResponse(
                status_code=400, 
                content={"message": f"File {file.filename} is not a PDF. Only PDF files are allowed."}
            )
    
    session_id = str(uuid.uuid4())
    file_paths = []

    try:
        for file in files:
            # Read file content
            content = await file.read()
            
            # Upload to Cloudinary in tempPDF folder with session_id as filename
            upload_result = cloudinary.uploader.upload(
                content,
                resource_type="raw",
                public_id=f"tempPDF/{session_id}",
                format="pdf"
            )
            
            # Get the secure URL of the uploaded file
            file_url = upload_result['secure_url']
            file_paths.append(file_url)

        vectorstore = process_pdf(file_paths, session_id)
        sessions[session_id] = vectorstore 

        return {"session_id": session_id}
    except Exception as e:
        # Clean up Cloudinary resources in case of error
        for path in file_paths:
            try:
                cloudinary.uploader.destroy(
                    f"tempPDF/{session_id}",
                    resource_type="raw"
                )
            except:
                pass
        return JSONResponse(
            status_code=500,
            content={"message": f"Error processing files: {str(e)}"}
        )

@app.post("/chat/")
async def chat(session_id: str = Form(...), query: str = Form(...)):
    # Check if the query is empty
    if not query.strip():
        return JSONResponse(status_code=400, content={"message": "Query cannot be empty"})
    
    try:
        client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
        
        # Check if the collection exists
        if not client.collection_exists(collection_name=session_id):
            return JSONResponse(status_code=404, content={"message": "Session not found"})
        
        embeddings = GoogleGenerativeAIEmbeddings(
            google_api_key=GOOGLE_API_KEY,
            model="models/embedding-001"
        )

        vectorstore = QdrantVectorStore(
            collection_name=session_id,
            client=client,
            embedding=embeddings
        )
        
        # Get answer and sources from chat.py
        result = get_answer_with_sources(vectorstore, query)
        
        return {
            "answer": result["answer"],
            "source_documents": result["source_documents"],
            "session_id": session_id
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Error processing chat request: {str(e)}"}
        )

@app.post("/end_session/")
async def end_session(session_id: str = Form(...)):
    client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    try:
        # Delete file from Cloudinary
        try:
            # Try to delete the file
            delete_result = cloudinary.uploader.destroy(
                public_id=f"tempPDF/{session_id}.pdf",
                resource_type="raw",
                type="upload",
                invalidate=True
            )
            print(f"Cloudinary delete result: {delete_result}")

            if delete_result.get('result') != 'ok':
                print(f"Failed to delete file: {delete_result}")
                return {"message": "Failed to delete file from Cloudinary"}

        except cloudinary.api.NotFound:
            print(f"File not found in Cloudinary: tempPDF/{session_id}")
        except Exception as cloudinary_error:
            print(f"Cloudinary cleanup error: {str(cloudinary_error)}")
            print(f"Error type: {type(cloudinary_error)}")
            return {"message": f"Error deleting from Cloudinary: {str(cloudinary_error)}"}

        # Delete collection from Qdrant
        if client.collection_exists(collection_name=session_id):
            client.delete_collection(collection_name=session_id)
            return {"message": "Session ended and data cleared."}
        else:
            return {"message": "Session not found."}
    except Exception as e:
        print(f"General error in end_session: {str(e)}")
        return {"message": f"Error ending session: {e}"}
    
@app.get("/health")
async def health():
    return {"status": "ok"}