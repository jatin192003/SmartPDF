from typing import List
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
import os

from app.config import QDRANT_URL, GOOGLE_API_KEY, QDRANT_API_KEY

def process_pdf(file_path: List[str], session_id: str) -> QdrantVectorStore:
    if not file_path:
        raise ValueError("No files provided to process")
        
    documents = []
    try:
        for path in file_path:
            if not os.path.exists(path):
                raise FileNotFoundError(f"File not found: {path}")
                
            if not path.lower().endswith('.pdf'):
                raise ValueError(f"File {path} is not a PDF")
                
            try:
                loader = PyPDFLoader(path)
                docs = loader.load()
                documents.extend(docs)
            except Exception as e:
                raise ValueError(f"Error loading PDF {path}: {str(e)}")
        
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

        # Create the vector store directly
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
    
    
