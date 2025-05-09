import os
import shutil
import uuid
from typing import List
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from qdrant_client import QdrantClient
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from app.utils import process_pdf
from app.chat import get_answer_with_sources
from app.config import QDRANT_URL, QDRANT_API_KEY, GOOGLE_API_KEY


app = FastAPI()
sessions = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    os.makedirs(f"temp/{session_id}", exist_ok=True)
    file_paths = []

    try:
        for file in files:
            file_path = f"temp/{session_id}/{file.filename}"
            with open(file_path, "wb") as f:
                f.write(await file.read())
            file_paths.append(file_path)

        vectorstore = process_pdf(file_paths, session_id)
        sessions[session_id] = vectorstore 

        return {"session_id": session_id}
    except Exception as e:
        # Clean up temp directory in case of error
        shutil.rmtree(f"temp/{session_id}", ignore_errors=True)
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
        shutil.rmtree(f"temp/{session_id}", ignore_errors=True)
        if client.collection_exists(collection_name=session_id):
            client.delete_collection(collection_name=session_id)
            return {"message": "Session ended and data cleared."}
        else:
            return {"message": "Session not found."}
    except Exception as e:
        return {"message": f"Error ending session: {e}"}

