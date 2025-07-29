import { Inter } from "next/font/google";
import "./globals.css";
import { ColorModeProvider } from "@/context/ColorModeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "RFID Attendance Dashboard",
  description: "Real-time attendance monitoring system",
  icons: {
    icon: "/isd_icon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ColorModeProvider>
          {children}
        </ColorModeProvider>
      </body>
    </html>
  );
}