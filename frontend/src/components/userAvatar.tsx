'use client'

import { useUser } from "@clerk/nextjs"

export default function UserAvatar() {
    const user = useUser()
    if (!user) return null
    return (
        <div>
            <img src={user.user?.imageUrl} alt="user avatar" className=" h-[30px] w-[30px] rounded-full" />
        </div>

    )
}
