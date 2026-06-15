import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shared Expenses App",
  description: "A premium shared expenses management app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
              <a href="/login" className="btn btn-secondary">Login</a>
              <a href="/groups" className="btn btn-secondary">Dashboard</a>
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
