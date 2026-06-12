import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PosterForge AI",
  description: "Bulk Personalized Poster Generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}