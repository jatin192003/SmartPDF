'use client'

import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { HomeIcon, LogOutIcon } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { SignOutButton, UserButton } from "@clerk/nextjs";
import { Upload } from "@/components/upload";
import Chatbox from "@/components/chatbox";

export default function Chat() {
    const [open, setOpen] = useState(false);
    return (
        <div
      className=
        "h-screen flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800" // for your use case, use `h-screen` instead of `h-[60vh]`
      
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
                <SignOutButton>
                    <SidebarLink link={{
                        label: 'Logout',
                        href: '#',
                        icon: <LogOutIcon className="h-5 w-5 shrink-0"/>
                    }}/>
                </SignOutButton>
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      <Dashboard />
    </div>
  );
}
export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        SmartPDF
      </motion.span>
    </a>
  );
};
export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </a>
  );
};
 
// Dummy dashboard component with content
const Dashboard = () => {
  return (
    <div className="flex w-full">
      <div className="flex h-full w-2/3 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900">
        <Upload/>
      </div>
      <div className="flex h-full w-full flex-col gap-2 rounded-tr-2xl border border-neutral-200 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900">
        <Chatbox/>
      </div>
    </div>
    )

}
