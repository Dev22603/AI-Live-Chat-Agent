import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShopEase Support Chat - AI-Powered Customer Service",
  description: "Get instant answers to your questions about ShopEase products, orders, shipping, and returns. Our AI-powered chat assistant is available 24/7 to help you.",
  keywords: "ShopEase, customer support, live chat, AI assistant, e-commerce help, order tracking, shipping information",
  authors: [{ name: "ShopEase" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  robots: "index, follow",
  openGraph: {
    title: "ShopEase Support Chat",
    description: "24/7 AI-powered customer support for ShopEase",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
