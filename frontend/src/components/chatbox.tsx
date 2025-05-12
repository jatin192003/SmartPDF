'use client'

import { useState, useRef, useEffect } from 'react';
import { IconSend } from '@tabler/icons-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/lib/redux/hooks';
import { chat } from '@/lib/redux/slices/sessionSlice';
import { useAppDispatch } from '@/lib/redux/hooks';
import { useUser } from '@clerk/nextjs';
import UserAvatar from './userAvatar';

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
  const { sessionId } = useAppSelector(state => state.session);
  const dispatch = useAppDispatch();
  const { user } = useUser();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || !sessionId) return;
    
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
        console.log(response);
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
      {/* Messages area - this is the only scrollable part */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 md:h-8 md:w-8 text-blue-500 dark:text-blue-300" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
                />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-200">
              No messages yet
            </h3>
            <p className="text-sm md:text-base text-neutral-500 dark:text-neutral-400 max-w-xs mt-2">
              Ask questions about your document and get accurate answers based on the content
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                "flex items-start gap-2 md:gap-3",
                message.sender === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {/* For bot messages: Show avatar on the left side */}
              {message.sender === 'bot' && (
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 md:h-5 md:w-5 text-white" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 01-.659 1.591L9.5 14.5m3.75-11.729V3.104A7.5 7.5 0 119.5 14.5h-8.25a7.5 7.5 0 117.5-7.5v10.75c2.25-1.947 3.75-4.058 3.75-7.25z" 
                    />
                  </svg>
                </div>
              )}
              
              {/* Message content */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "max-w-[85%] sm:max-w-[80%] md:max-w-[70%] p-3 md:p-4 rounded-2xl shadow-sm backdrop-blur-sm",
                  message.sender === 'user' 
                    ? "bg-blue-500 text-white rounded-tr-none" 
                    : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-tl-none"
                )}
              >
                {/* Message sender name */}
                <div className="flex items-center mb-1">
                  <p className={cn(
                    "text-xs font-medium",
                    message.sender === 'user' 
                      ? "text-blue-50" 
                      : "text-neutral-500 dark:text-neutral-400"
                  )}>
                    {message.sender === 'user' ? user?.fullName || 'You' : 'PDF Assistant'}
                  </p>
                </div>
                
                {/* Message text content */}
                {message.sender === 'user' ? (
                  <p className="text-xs sm:text-sm text-white">
                    {message.text}
                  </p>
                ) : (
                  <div className="markdown-content text-xs sm:text-sm text-neutral-800 dark:text-neutral-200">
                    <ReactMarkdown
                      components={{
                        code({node, className, children, ...props}: {inline?: boolean} & any) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !props.inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{
                                borderRadius: '0.5rem',
                                margin: '1rem 0',
                                fontSize: '0.8rem',
                              }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>
                )}
                
                {/* Timestamp */}
                <div className="flex items-center mt-2 space-x-2">
                  <p className="text-[10px] sm:text-xs text-neutral-400 dark:text-neutral-500">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
              
              {/* For user messages: Show avatar on the right side */}
              {message.sender === 'user' && <UserAvatar />}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area - fixed at the bottom */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 sticky bottom-0">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="relative">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 animate-gradient-x "></div>
              
              {/* Content with translucent background */}
              <div className="relative bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm p-2 flex items-center rounded-lg">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="animate-pulse h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 01-.659 1.591L9.5 14.5m3.75-11.729V3.104A7.5 7.5 0 119.5 14.5h-8.25a7.5 7.5 0 117.5-7.5v10.75c2.25-1.947 3.75-4.058 3.75-7.25z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-neutral-800 dark:text-neutral-200">
                      PDF Assistant is thinking...
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Analyzing document content to generate a response
                    </p>
                  </div>
                  
                  {/* Animated dots */}
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-900 p-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 bg-transparent px-3 py-2 outline-none text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={inputValue.trim() === ''}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  inputValue.trim() === '' 
                    ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed" 
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                )}
              >
                <IconSend className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        <p className="text-xs text-center text-neutral-400 dark:text-neutral-500 mt-2">
          {loading ? "Please wait while we process your question..." : "Ask specific questions about your PDF for the most accurate answers"}
        </p>
      </div>
    </div>
  );
}
