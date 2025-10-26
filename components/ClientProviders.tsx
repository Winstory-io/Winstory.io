"use client";

import { ThirdwebProvider } from "thirdweb/react";
import Providers from "./Providers";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThirdwebProvider>
      <Providers>
        {children}
      </Providers>
    </ThirdwebProvider>
  );
} 