"use client"
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function Topbar() {
    const [isPopularMode, setIsPopularMode] = useState(false);

    const togglePopularMode = () => {
        setIsPopularMode(!isPopularMode);
        
    };
    
    return (
        <nav className="topbar">
            <Link href="/" className="flex items-center gap-4">
                <Image src="/assets/logo1_owl1.svg" alt="logo" width={30} height={30} className="border-2 border-white rounded-full hover:opacity-60"/>
                <p className="text-heading3-bold text-light-1 max-xs:hidden hover:underline">Hootz</p>
            </Link>
            
            <div className="flex items-center gap-5">

                <UserButton 
                appearance={{
                    elements: {
                      button__manageAccount: "manage-account-class",
                    },
                  }}
                />

            </div>
        </nav>
    )
}

export default Topbar;