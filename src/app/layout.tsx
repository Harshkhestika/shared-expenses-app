import type { Metadata } from "next";
import { cookies } from 'next/headers';
import LogoutButton from '@/components/LogoutButton';
import "./globals.css";

export const metadata: Metadata = {
  title: "Shared Expenses App",
  description: "A premium shared expenses management app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <div className="container">
          <header className="header-nav animate-fade-in">
            <div className="header-logo">SplitPro</div>
            <nav style={{ display: 'flex', gap: '1rem' }}>
              {!userId && <a href="/login" className="btn btn-secondary">Login</a>}
              {userId && <a href="/groups" className="btn btn-secondary">Dashboard</a>}
              {userId && <LogoutButton />}
            </nav>
          </header>
          <main className="animate-fade-in">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
