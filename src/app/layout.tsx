import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import QueryProvider from "@/components/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ipemelere - Safe & Reliable Transport Services in Malawi",
    template: "%s | Ipemelere Transport",
  },
  description: "Safe, reliable, and affordable ride-hailing services across Lilongwe, Malawi. Book your ride with Ipemelere - your trusted transport partner available 24/7.",
  keywords: [
    "Malawi transport",
    "Lilongwe taxi",
    "ride hailing Malawi", 
    "safe transport Malawi",
    "taxi booking Lilongwe",
    "Ipemelere",
    "transport services",
    "ride sharing Malawi"
  ],
  authors: [{ name: "Ipemelere Transport Services" }],
  creator: "Ipemelere Transport Services",
  publisher: "Ipemelere Transport Services",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_MW',
    url: '/',
    siteName: 'Ipemelere Transport Services',
    title: 'Ipemelere - Safe & Reliable Transport Services in Malawi',
    description: 'Safe, reliable, and affordable ride-hailing services across Lilongwe, Malawi. Book your ride with Ipemelere - your trusted transport partner available 24/7.',
    images: [
      {
        url: '/Ipemelere_Logo.png',
        width: 1200,
        height: 630,
        alt: 'Ipemelere Transport Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@Ipemelere_MW',
    creator: '@Ipemelere_MW',
    title: 'Ipemelere - Safe & Reliable Transport Services in Malawi',
    description: 'Safe, reliable, and affordable ride-hailing services across Lilongwe, Malawi. Book your ride with Ipemelere - your trusted transport partner available 24/7.',
    images: ['/Ipemelere_Logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification IDs when available
    // google: 'google-site-verification-id',
    // bing: 'bing-site-verification-id',
  },
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
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
