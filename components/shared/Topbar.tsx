import { OrganizationSwitcher, SignOutButton, SignedIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { dark } from '@clerk/themes'

function Topbar() {
    return (
        <nav className="topbar">
            <Link href="/" className="flex items-center gap-4">
                <Image src="/assets/logo1_b&w.svg" alt="logo" width={30} height={30} className="border-2 border-white rounded-full hover:opacity-60"/>
                <p className="text-heading3-bold text-light-1 max-xs:hidden hover:underline">Hootz</p>
            </Link>

            <div className="flex items-center gap-1">
                <div className="block md:hidden">
                    <SignedIn>
                        <SignOutButton>
                            <div className="flex cursor-pointer">
                                <Image src="/assets/logout.svg" alt="logout" width={24} height={24} className="hover:scale-110" />
                            </div>
                        </SignOutButton>
                    </SignedIn>
                </div>

                <OrganizationSwitcher 
                    appearance={{
                        baseTheme: dark,
                        elements: {
                            organizationSwitcherTrigger: "py-2 px-4"
                        }
                    }}
                />
            </div>
        </nav>
    )
}

export default Topbar;