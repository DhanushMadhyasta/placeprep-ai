import type { Metadata } from "next";
import { IBM_Plex_Sans, Courier_Prime } from "next/font/google";
import "./globals.css";
import { AuthWatcher } from "@/components/AuthWatcher";

const plex = IBM_Plex_Sans({ weight: ["300", "400", "500", "600"], subsets: ["latin"] });
const _courier = Courier_Prime({ weight: ["400", "700"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PlacePrep AI",
  description: "Practise aptitude, DSA, reasoning and system design with timed quizzes and AI-generated questions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={plex.className}>
        <AuthWatcher />
        {children}
      </body>
    </html>
  );
}