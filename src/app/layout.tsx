import type { Metadata } from "next";
import "@/style/global.css";

export const metadata: Metadata = {
  title: "Resource Pack Creator - By Rok"
};


declare global {
  interface Window {
    electron: {
      showOpenDialog: (options: { properties: string[] }) => Promise<string[]>;
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-minecraft">
        {children}
      </body>
    </html>
  );
}