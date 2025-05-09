# SmartPDF

SmartPDF is an interactive PDF chat application that allows users to upload PDF documents and ask questions about their content. The application uses AI to extract, process, and provide contextually relevant answers from the uploaded documents.

![SmartPDF Logo](https://insert-your-logo-url-here.com)

## 🌟 Features

- **PDF Upload**: Upload one or multiple PDF documents for analysis
- **Conversational Interface**: Chat with your PDFs using natural language questions
- **AI-Powered Responses**: Get accurate answers with source references from your documents
- **Session Management**: Create and end document processing sessions as needed
- **Modern UI**: Clean, responsive interface with dark mode support

## 🏗️ Architecture

SmartPDF is built with a modern stack using a client-server architecture:

### Backend (Python)

- **FastAPI**: High-performance API framework
- **LangChain**: Framework for building applications with language models
- **Google Generative AI**: Provides embeddings and LLM capabilities
- **Qdrant**: Vector database for storing document embeddings
- **PyPDF**: Library for PDF processing

### Frontend (Next.js)

- **Next.js**: React framework for building user interfaces
- **React**: JavaScript library for building user interfaces
- **Redux**: State management
- **shadcn/ui**: Component library for modern UI
- **Clerk**: Authentication provider

## 🧠 How Retrieval-Augmented Generation (RAG) Works in SmartPDF

SmartPDF uses a RAG pipeline to provide accurate, context-aware answers from your uploaded PDFs:

1. **Document Ingestion**:  
   Users upload one or more PDF files. The backend extracts text from these PDFs and splits them into manageable chunks.

2. **Embedding Generation**:  
   Each chunk of text is converted into a vector embedding using Google Generative AI's embedding model.

3. **Vector Storage**:  
   The embeddings are stored in a Qdrant vector database, organized by session.

4. **Query Handling**:  
   When a user asks a question, the query is also converted into an embedding.

5. **Retrieval**:  
   The system searches the Qdrant database for the most relevant document chunks (based on vector similarity to the query).

6. **Augmented Generation**:  
   The retrieved chunks are provided as context to a large language model (LLM, e.g., Google Gemini), which generates a natural language answer grounded in the source documents.

7. **Response with Sources**:  
   The answer and the relevant source document snippets are returned to the user, ensuring transparency and traceability.

## 🔄 Workflow

1. User uploads one or more PDF documents through the frontend.
2. Backend processes the PDFs:
   - Extracts text using PyPDFLoader.
   - Splits text into manageable chunks.
   - Creates embeddings using Google's embedding model.
   - Stores embeddings in Qdrant vector database with session ID.
3. User asks questions through the chat interface.
4. Backend processes the query:
   - Retrieves relevant document chunks based on semantic similarity (RAG).
   - Uses Google Gemini to generate a contextual answer.
   - Returns answer with source references.
5. User can end the session, which cleans up resources.

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- Google AI API key
- Qdrant instance (cloud or local)

### Backend Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/smart-pdf.git
   cd smart-pdf/backend
   ```

2. Create a virtual environment
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables
   ```bash
   # Create .env file with:
   GOOGLE_API_KEY=your_google_api_key
   QDRANT_URL=your_qdrant_url
   QDRANT_API_KEY=your_qdrant_api_key
   ```

5. Run the backend server
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory
   ```bash
   cd ../frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   # Create .env.local file with:
   NEXT_PUBLIC_API_URL=http://localhost:8000
   # Add any Clerk authentication variables if using authentication
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔒 Security

- Temporary files are cleaned up after session end
- API key protection
- Session-based data isolation


Made with ❤️ by Jatin Chhabra
