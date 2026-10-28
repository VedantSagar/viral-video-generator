import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Viral Video Generator", description: "Short-form video generation workspace" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
