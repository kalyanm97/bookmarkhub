import './globals.css';
import type { Metadata } from 'next';
import AppShell from '../components/AppShell';
import { ToastProvider } from '../components/ui/Toast';

export const metadata: Metadata = {
  title: 'BookmarkHub',
  description: 'Share and vote on the best links',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}