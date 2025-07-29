import { Inter } from "next/font/google";
import "./globals.css";
import { ColorModeProvider } from "@/context/ColorModeContext";
import { AuthProvider } from "@/context/AuthContext";
import PWAProvider from "@/app/providers/PWAProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "RFID Attendance Dashboard",
  description: "Real-time attendance monitoring system",
  manifest: "/manifest.json",
  themeColor: "#1976d2",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  icons: {
    icon: "/isd_icon.ico",
    apple: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lab Attendance",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PWAProvider>
          <ColorModeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ColorModeProvider>
        </PWAProvider>
      </body>
    </html>
  );
}