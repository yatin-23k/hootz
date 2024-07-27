"use client"
import { rightSidebarLinks } from '@/constants';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react'
import { Button } from '../ui/button';

const PopularList = () => {
    const pathname = usePathname();
    const router = useRouter()
  return (
    <>
      <Button className="h-auto min-w-[25px] rounded-lg bg-primary-500 text-[15px] text-light-1 !important;" onClick={() => router.push("/search")}>
              Find More Users
      </Button>
      <div className="flex flex-1 flex-col justify-start">
          <h3 className="text-heading4-medium text-light-1">Popular Posts</h3>
          <div className="mt-3 flex w-[300px] flex-col ">
            {rightSidebarLinks.map((link) => {
              const isActive = (pathname.includes(link.route) && link.route.length > 1) || pathname === link.route;
              return (
                <Link
                  href={link.route}
                  key={link.label}
                  className={`rightsidebar_link hover:bg-primary-500 ${isActive && `bg-primary-250`}`
                  }
                >

                  <p className="text-light-1 max-lg:hidden">{link.label}</p>
                </Link>
              );
            })}
          </div>
      </div>
    </>
  )
}

export default PopularList