import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FROMM MEDIA Archive — THE BOYZ ARCHIVE",
  description: "Fan-made Fromm media archive for THE BOYZ, synchronized with Google Drive.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "FROMM MEDIA Archive — THE BOYZ ARCHIVE",
    description: "Group and member media, organized by date and synchronized with Google Drive.",
    images: [{ url: "/og.png", width: 1736, height: 911, alt: "FROMM MEDIA ARCHIVE" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
