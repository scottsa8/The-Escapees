'use client';
import { StrictMode } from "react";
import "./globals.css";
import { QueryClient, QueryClientProvider } from 'react-query';

export const network = {
  ip: "localhost",
  port: "8443"
}

export default function RootLayout({ children }) {
  const queryClient = new QueryClient();
  return (
    <html lang="en">
      {/* <StrictMode> */}
      <QueryClientProvider client={queryClient}>
        <body>{children}</body>
      </QueryClientProvider>
      {/* </StrictMode> */}
    </html>
  );
}
