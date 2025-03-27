import { Roboto } from 'next/font/google'
import "./globals.css";

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata = {
  title: "Routewise",
  description: "Route Optimize",
  icons: {
    icon: [
      {
        url: "/Logo.png",
        href: "/Logo.png",
      },
    ],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={roboto.className}>{children}</body>
    </html>
  )
}
