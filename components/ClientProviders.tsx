"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import Providers from "@/components/Providers";
import { ThirdwebProvider, ChainId } from "@thirdweb-dev/react";
import { useAccessibilityFix } from "@/lib/hooks/useAccessibilityFix";

export default function ClientProviders({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000, // 1 minute
        cacheTime: 10 * 60 * 1000, // 10 minutes (v4 uses cacheTime, not gcTime)
      },
    },
  }));

  // Apply accessibility fixes for thirdweb components
  useAccessibilityFix();

  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider
        clientId="4ddc5eed2e073e550a7307845d10f348"
        activeChain={ChainId.Mainnet}
        dAppMeta={{
          name: "Winstory.io",
          description: "Create and moderate your win stories",
          logoUrl: "/logo.svg",
          url: "https://winstory.io",
        }}
      >
        <Providers>
          {children}
        </Providers>
      </ThirdwebProvider>
    </QueryClientProvider>
  );
} 