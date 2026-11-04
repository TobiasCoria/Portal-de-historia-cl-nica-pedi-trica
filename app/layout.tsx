import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import FeedbackMovimiento from "./components/feedback-movimiento";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = localFont({
  variable: "--font-fraunces",
  src: [{ path: "./fonts/fraunces-500.ttf", weight: "500" }, { path: "./fonts/fraunces-600.ttf", weight: "600" }],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portal Pediatría",
  description: "Historia clínica y gestión de pacientes",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <FeedbackMovimiento />
        {children}
      </body>
    </html>
  );
}