import { Inter } from "next/font/google";
import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";

import LeftSidebar from "@/components/shared/LeftSidebar";
import Topbar from "@/components/shared/Topbar";
import RightSidebar from "@/components/shared/RightSIdebar";
import Bottombar from "@/components/shared/Bottombar";
import { dark } from "@clerk/themes";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Hootz",
  description: "A Next.js 13 Hootz Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
        <html lang="en">
          <body className={inter.className}>
            <Topbar />

            <main className="flex flex-row">
              <LeftSidebar />

              <section className="main-container">
                <div className="w-full max-w-4xl">
                  {children}
                </div>
              </section>
              
              <RightSidebar />
            </main>

            <Bottombar />
          </body>
        </html>
    </ClerkProvider>
    
  );
}
