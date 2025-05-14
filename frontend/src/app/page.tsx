"use client"

import { AuroraBackground } from "@/components/ui/aurora-background";
import { useAuth } from "@clerk/nextjs";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function Home() {
  const router = useRouter()
  const { isLoaded, userId } = useAuth();
  useEffect(() => {
    if (isLoaded && userId) {
      router.push('/chat')
    }
  }, [isLoaded, userId, router])
  return (
    <div className="h-screen w-screen">
      <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        <div className="text-2xl sm:text-3xl md:text-7xl font-bold dark:text-white text-center">
          SmartPDF
        </div>
        <div className="font-extralight text-center text-sm sm:text-base md:text-4xl dark:text-neutral-200 py-2 md:py-4 max-w-md md:max-w-2xl">
        Turn PDFs into conversations - your documents, now answering your questions.
        </div>
        <button className="bg-black cursor-pointer dark:bg-white rounded-full w-fit text-white dark:text-black px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base" onClick={() => router.push('/login')}>
          Get Started
        </button>
      </motion.div>
    </AuroraBackground>
    </div>
  );
}
