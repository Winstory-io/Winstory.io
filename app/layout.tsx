"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import Providers from "@/components/Providers";

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en">
      <body style={{ background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
        <QueryClientProvider client={queryClient}>
          <Providers>
            {children}
          </Providers>
        </QueryClientProvider>
      </body>
    </html>
  );
} 