import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface SessionState {
  sessionId: string | null;
  isSessionActive: boolean;
  isLoading: boolean;
  error: string | null;
  files: File[];
}

const initialState: SessionState = {
  sessionId: null,
  isSessionActive: false,
  isLoading: false,
  error: null,
  files: [],
};

export const uploadPdfs = createAsyncThunk(
  'session/uploadPdfs',
  async (files: File[], { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append(`files`, file);
      });
      
      const response = await fetch('http://127.0.0.1:8000/upload_pdfs/', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading PDFs:', error);
      return rejectWithValue((error as Error).message || 'Upload failed');
    }
  }
);

export const chat = createAsyncThunk(
  'session/chat',
  async ({ sessionId, query }: { sessionId: string, query: string }, { rejectWithValue }) => {
    try {
      // Create a URLSearchParams object for x-www-form-urlencoded format
      const formData = new URLSearchParams();
      formData.append('session_id', sessionId);
      formData.append('query', query);
      
      const response = await fetch('http://127.0.0.1:8000/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Query failed');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error chatting:', error);
      return rejectWithValue((error as Error).message || 'Chat failed');
    }
  }
);

export const endSession = createAsyncThunk(
  'session/endSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      // Create a URLSearchParams object for x-www-form-urlencoded format
      const formData = new URLSearchParams();
      formData.append('session_id', sessionId);
      
      const response = await fetch('http://127.0.0.1:8000/end_session/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to end session');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error ending session:', error);
      return rejectWithValue((error as Error).message || 'Failed to end session');
    }
  }
);

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setFiles: (state, action: PayloadAction<File[]>) => {
      state.files = action.payload;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload PDFs cases
      .addCase(uploadPdfs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadPdfs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessionId = action.payload.session_id;
        state.isSessionActive = true;
      })
      .addCase(uploadPdfs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Upload failed';
      })
      
      // End session cases
      .addCase(endSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(endSession.fulfilled, (state) => {
        state.isLoading = false;
        state.sessionId = null;
        state.isSessionActive = false;
        state.files = [];
      })
      .addCase(endSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to end session';
      });
  },
});

export const { setFiles, clearError } = sessionSlice.actions;
export default sessionSlice.reducer; 