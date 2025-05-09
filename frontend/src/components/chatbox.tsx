'use client'

import { useState, useRef, useEffect } from 'react';
import { IconSend } from '@tabler/icons-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/lib/redux/hooks';
import { chat } from '@/lib/redux/slices/sessionSlice';
import { useAppDispatch } from '@/lib/redux/hooks';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function Chatbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { sessionId, isSessionActive } = useAppSelector(state => state.session);
  const dispatch = useAppDispatch();
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || !isSessionActive || !sessionId) return;
    
    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    const userQuery = inputValue;
    setInputValue('');
    setLoading(true);
    
    try {
        const response = await dispatch(chat({ sessionId: sessionId, query: userQuery })).unwrap();
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: response.answer,
            sender: 'bot',
            timestamp: new Date(),
        }]);
        setLoading(false);
    } catch (error) {
        console.error('Error chatting:', error);
        setLoading(false);
    }
    
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="border-b border-neutral-200 dark:border-neutral-700 p-4">
        <h2 className="font-medium text-lg">
          {isSessionActive 
            ? 'Chat with your PDF' 
            : 'Upload a PDF first to start chatting'}
        </h2>
        {sessionId && (
          <p className="text-xs text-neutral-500">Session: {sessionId}</p>
        )}
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!isSessionActive ? (
          <div className="flex items-center justify-center h-full text-neutral-400 dark:text-neutral-500 min-h-[200px]">
            <p>Please upload and process a PDF to start a conversation</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-neutral-400 dark:text-neutral-500 min-h-[200px]">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "max-w-[80%] p-3 rounded-lg",
                message.sender === 'user' 
                  ? "bg-neutral-100 dark:bg-neutral-800 ml-auto" 
                  : "bg-blue-50 dark:bg-blue-900 mr-auto"
              )}
            >
              <p className={cn(
                "text-sm",
                message.sender === 'user' 
                  ? "text-neutral-800 dark:text-neutral-200" 
                  : "text-blue-800 dark:text-blue-100"
              )}>
                {message.text}
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 p-4">
        <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg p-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isSessionActive ? "Type your message..." : "Upload and process a PDF first"}
            disabled={!isSessionActive}
            className={cn(
              "flex-1 bg-transparent outline-none text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500",
              !isSessionActive && "cursor-not-allowed"
            )}
          />
          <button
            onClick={handleSendMessage}
            disabled={inputValue.trim() === '' || !isSessionActive || loading}
            className={cn(
              "p-2 rounded-full transition-colors",
              (inputValue.trim() === '' || !isSessionActive || loading)
                ? "text-neutral-400 dark:text-neutral-600 cursor-not-allowed" 
                : "text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900"
            )}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <IconSend className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
