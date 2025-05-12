from typing import List
import requests
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
import tempfile
import os

from app.config import QDRANT_URL, GOOGLE_API_KEY, QDRANT_API_KEY

def download_from_cloudinary(url: str) -> str:
    """Download a file from Cloudinary and save it to a temporary file."""
    response = requests.get(url)
    if response.status_code != 200:
        raise ValueError(f"Failed to download file from {url}")
    
    # Create a temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    temp_file.write(response.content)
    temp_file.close()
    
    return temp_file.name

def process_pdf(file_paths: List[str], session_id: str) -> QdrantVectorStore:
    if not file_paths:
        raise ValueError("No files provided to process")
        
    documents = []
    temp_files = []
    
    try:
        for url in file_paths:
            try:
                # Download file from Cloudinary
                temp_path = download_from_cloudinary(url)
                temp_files.append(temp_path)
                
                # Load and process the PDF
                loader = PyPDFLoader(temp_path)
                docs = loader.load()
                documents.extend(docs)
            except Exception as e:
                raise ValueError(f"Error loading PDF from {url}: {str(e)}")
        
        if not documents:
            raise ValueError("No content extracted from PDF files")
            
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        chunks = text_splitter.split_documents(documents)
        
        if not chunks:
            raise ValueError("No text chunks created from documents")

        try:
            embeddings = GoogleGenerativeAIEmbeddings(
                google_api_key=GOOGLE_API_KEY,
                model="models/embedding-001"
            )
        except Exception as e:
            raise RuntimeError(f"Failed to initialize embeddings: {str(e)}")

        # Create the vector store
        try:
            vector_store = QdrantVectorStore.from_documents(
                documents=chunks,
                embedding=embeddings,
                collection_name=session_id,
                url=QDRANT_URL,
                api_key=QDRANT_API_KEY
            )
            return vector_store
        except Exception as e:
            raise RuntimeError(f"Failed to create vector store: {str(e)}")
    except Exception as e:
        # Cleanup any partial data
        try:
            client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
            if client.collection_exists(collection_name=session_id):
                client.delete_collection(collection_name=session_id)
        except:
            pass  # Ignore cleanup errors
        raise  # Re-raise the original exception
    finally:
        # Clean up temporary files
        for temp_file in temp_files:
            try:
                os.unlink(temp_file)
            except:
                pass