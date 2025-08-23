import ClientProviders from "@/components/ClientProviders";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
} 