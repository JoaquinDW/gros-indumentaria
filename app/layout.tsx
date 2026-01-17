import type React from "react"
import type { Metadata } from "next"
import { Gantari, Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { FloatingWhatsApp } from "@/components/floating-whatsapp"
import "./globals.css"

const _geist = Gantari({ subsets: ["latin"] })
// const _geistMono = Gantari({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gros Indumentaria | Prendas Personalizables",
  description:
    "Gráfica textil, sublimación y confección de prendas personalizadas para clubes y particulares",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        {children}
        <FloatingWhatsApp />
        <Analytics />
      </body>
    </html>
  )
}
