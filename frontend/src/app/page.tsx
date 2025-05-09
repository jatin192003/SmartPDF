"use client"

import { AuroraBackground } from "@/components/ui/aurora-background";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
export default function Home() {
  const router = useRouter()
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
        <div className="text-3xl md:text-7xl font-bold dark:text-white text-center">
          SmartPDF
        </div>
        <div className="font-extralight text-center text-base md:text-4xl dark:text-neutral-200 py-4">
        Turn PDFs into conversations - your documents, now answering your questions.
        </div>
        <button className="bg-black cursor-pointer dark:bg-white rounded-full w-fit text-white dark:text-black px-4 py-2" onClick={() => router.push('/login')}>
          Get Started
        </button>
      </motion.div>
    </AuroraBackground>
    </div>
  );
}
