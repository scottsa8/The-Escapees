'use client';
import "./globals.css";
import { QueryClient, QueryClientProvider } from 'react-query';

export const network = {
  ip: "localhost",
  port: "8080"
}

export default function RootLayout({ children }) {
  const queryClient = new QueryClient();
  return (
    <html lang="en">
      <QueryClientProvider client={queryClient}>
        <body>{children}</body>
      </QueryClientProvider>
    </html>
  );
}
