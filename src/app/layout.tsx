"use client";
import { Plus_Jakarta_Sans } from 'next/font/google'; 
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Bounce, ToastContainer } from "react-toastify";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: 'swap',
  weight: ['400', '500', '600', '700'], 
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const publicPaths = ["/signin", "/signup", "/public-page"];
    
    const isPaymentPage = pathname?.startsWith("/payment"); 

    if (!token && !publicPaths.includes(pathname) && !isPaymentPage) {
      router.replace("/signin");
    }
  }, [pathname, router]);

  return (
    <html lang="en">
      <body className={`${jakarta.className} bg-gray-50 dark:bg-gray-900 font-sans antialiased`}>
        <ToastContainer
          style={{ marginTop: '4rem' }}
          position="top-right"
          autoClose={3000} 
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}
        />
        <ThemeProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}