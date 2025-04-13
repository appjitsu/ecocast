import { Button } from '@repo/ui';
import { SearchX } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.14))] flex-col items-center justify-center gap-8 p-4 text-center">
      <SearchX
        className="h-16 w-16 text-muted-foreground/50"
        strokeWidth={1.5}
      />

      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Oops! Page Not Found
      </h1>
      <p className="max-w-md text-muted-foreground">
        It seems the page you navigated to doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>
      <Link href="/">
        <Button variant="default">Go back home</Button>
      </Link>
    </div>
  );
}
