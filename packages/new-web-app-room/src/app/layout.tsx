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
  title: "Mood Sanctuary - Track Your Emotional Journey",
  description: "A therapeutic digital sanctuary to capture your day in 3 words + 1 emoji. Track emotional patterns, get AI-powered insights, and visualize your mood journey with beautiful gradients.",
  keywords: "mood tracker, mental health, emotional wellness, journaling, mindfulness, self-care",
  openGraph: {
    title: "Mood Sanctuary - Track Your Emotional Journey",
    description: "Capture your emotions in 3 words + 1 emoji. Beautiful, therapeutic, and insightful.",
    type: "website",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#7849ef",
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

