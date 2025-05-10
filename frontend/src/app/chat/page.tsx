'use client'

import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { HomeIcon, LogOutIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import { Upload } from "@/components/upload";
import Chatbox from "@/components/chatbox";
import UserAvatar from "@/components/userAvatar";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { endSession } from "@/lib/redux/slices/sessionSlice";
import { cn } from "@/lib/utils";

export default function Chat() {
  const [open, setOpen] = useState(false);
  const { isSessionActive, sessionId } = useAppSelector(state => state.session);
  const dispatch = useAppDispatch();

  // Handle tab/browser close events
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSessionActive && sessionId) {
        // Standard way to show a confirmation dialog before closing
        e.preventDefault();
        e.returnValue = "Your session will be ended. Are you sure you want to leave?";
        
        // Note: Modern browsers don't allow custom messages in the confirmation dialog
        // for security reasons, but this will still trigger a standard confirmation
        return e.returnValue;
      }
    };

    // Add event listener for tab/browser close
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Clean up
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isSessionActive, sessionId]);

  // Handle actual page unload to end the session
  useEffect(() => {
    const handleUnload = async () => {
      if (isSessionActive && sessionId) {
        // Use sendBeacon for more reliable delivery during page unload
        try {
          // Create form data for the request
          const formData = new FormData();
          formData.append('session_id', sessionId);
          
          // Use Navigator.sendBeacon which is designed for sending data
          // during page unload events
          navigator.sendBeacon(
            'http://127.0.0.1:8000/end_session/', 
            formData
          );
        } catch (error) {
          console.error('Failed to end session on page unload:', error);
        }
      }
    };

    window.addEventListener('unload', handleUnload);
    
    return () => {
      window.removeEventListener('unload', handleUnload);
    };
  }, [isSessionActive, sessionId]);

  return (
    <div className="h-screen w-full bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950">
      <div className="h-full w-full mx-auto max-w-[1920px] flex flex-col overflow-hidden md:flex-row">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              {open ? <Logo /> : <UserAvatar />}
              <div className="mt-8 flex flex-col gap-2">
                <SignOutButton>
                  <SidebarLink link={{
                    label: 'Logout',
                    href: '#',
                    icon: <LogOutIcon className="h-5 w-5 shrink-0" />
                  }} />
                </SignOutButton>
              </div>
            </div>
          </SidebarBody>
        </Sidebar>
        <Dashboard />
      </div>
    </div>
  );
}

export const Logo = () => {
  const user = useUser()
  if (!user) return null
  return (
    <div className="flex items-center gap-2">
      <img src={user.user?.imageUrl} alt="user avatar" className="h-[30px] w-[30px] rounded-full" />
      <span className="font-medium whitespace-pre text-black dark:text-white">{user.user?.fullName}</span>
    </div>
  );
};

// Dashboard component with conditional content
const Dashboard = () => {
  const { isSessionActive, sessionId, isLoading } = useAppSelector(state => state.session);
  const dispatch = useAppDispatch();
  
  const handleEndSession = () => {
    if (!sessionId) return;
    dispatch(endSession(sessionId));
  };
  
  return (
    <div className="flex flex-1 h-full w-full p-3 md:p-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full bg-white dark:bg-neutral-800 rounded-2xl shadow-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 flex flex-col"
      >
        {!isSessionActive ? (
          // Upload view - shown when no session is active
          <div className="flex h-full w-full flex-col">
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800">
              <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
                Upload Your PDF
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Upload a PDF file to start your conversation
              </p>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <Upload />
            </div>
          </div>
        ) : (
          // Chat view - shown when session is active
          <>
            {/* Fixed header that stays in place */}
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
                  Chat with your PDF
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Session ID: {sessionId?.substring(0, 8)}...
                </p>
              </div>
              
              <button
                onClick={handleEndSession}
                disabled={isLoading}
                className={cn(
                  "relative inline-flex h-10 overflow-hidden rounded-md p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50",
                )}
              >
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-md bg-slate-950 px-4 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Ending...
                    </span>
                  ) : (
                    "End Session"
                  )}
                </span>
              </button>
            </div>
            
            {/* Scrollable content area that fills remaining space */}
            <div className="flex-1 overflow-hidden">
              <Chatbox />
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
