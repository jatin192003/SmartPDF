from langchain.chat_models import init_chat_model
from langchain_qdrant import QdrantVectorStore
from app.config import GOOGLE_API_KEY

def get_answer_with_sources(vector_store: QdrantVectorStore, query: str):
    if not query or not query.strip():
        raise ValueError("Query cannot be empty")
    
    if not vector_store:
        raise ValueError("Vector store is not initialized")
    
    try:
        # Get relevant documents directly from the retriever
        retriever = vector_store.as_retriever(search_kwargs={"k": 5})
        docs = retriever.get_relevant_documents(query)
        
        if not docs:
            return {
                "answer": "I couldn't find any relevant information to answer your question.",
                "source_documents": []
            }
        
        # Format documents for the prompt
        context = "\n\n".join([doc.page_content for doc in docs])
        
        try:
            # Initialize LLM directly
            llm = init_chat_model(model="gemini-2.0-flash", model_provider="google-genai", google_api_key=GOOGLE_API_KEY)
        except Exception as e:
            raise RuntimeError(f"Failed to initialize LLM: {str(e)}")
        
        # Create prompt with context and query
        prompt = f"""
        Answer the question based on the following context:
        
        {context}
        
        Question: {query}
        """
        
        try:
            # Get response from LLM
            response = llm.predict(prompt)
            
            # Format source documents with metadata
            source_documents = [
                {
                    "content": doc.page_content,
                    "metadata": doc.metadata
                } for doc in docs
            ]
            
            return {
                "answer": response,
                "source_documents": source_documents
            }
        except Exception as e:
            raise RuntimeError(f"Failed to get response from LLM: {str(e)}")
            
    except Exception as e:
        # Handle any unexpected errors
        raise RuntimeError(f"Error processing query: {str(e)}")
    
    
