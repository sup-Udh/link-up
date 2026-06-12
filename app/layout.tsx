import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Linko",
  description: "Code together on LeetCode and other coding platforms in real time.",
  openGraph: {
    title: "Linko",
    description: "Collaborative coding made easy.",
    url: "https://www.linkocollab.xyz",
    images: [
      {
        url: "https://www.linkocollab.xyz/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Linko",
    description: "Collaborative coding made easy.",
    images: ["https://www.linkocollab.xyz/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased font-sans"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>

        <Script id="x-pixel" strategy="afterInteractive">
          {`
            !function(e,t,n,s,u,a){
              e.twq||(s=e.twq=function(){
                s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
              },
              s.version='1.1',
              s.queue=[],
              u=t.createElement(n),
              u.async=!0,
              u.src='https://static.ads-twitter.com/uwt.js',
              a=t.getElementsByTagName(n)[0],
              a.parentNode.insertBefore(u,a))
            }(window,document,'script');

            twq('config','rcywr');
            twq('track','PageView');
          `}
        </Script>

      </body>
    </html>
  );
}
