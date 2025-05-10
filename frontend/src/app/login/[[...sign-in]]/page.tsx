'use client'

import { BackgroundBeams } from "@/components/ui/background-beams";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { SignedIn, SignedOut, SignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Login() {
    const { isLoaded, userId } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
        if (isLoaded && userId) {
            router.push('/chat');
        }
    }, [isLoaded, userId, router]);
    
    return (
        <div className="flex justify-center items-center h-screen bg-neutral-950">
            <BackgroundBeams />
            <BackgroundGradient className="p-2">
                <SignedOut>
                    <SignIn />
                </SignedOut>
                <SignedIn>
                    {/* User is signed in, will be redirected by the useEffect above */}
                    <h1>You are signed in</h1>
                    <p>redirecting to chat</p>
                </SignedIn>
            </BackgroundGradient>
        </div>
    )
} 