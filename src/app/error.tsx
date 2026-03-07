'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js Global Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 text-red-500">
        <AlertCircle className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong!</h2>
      <p className="text-slate-600 mb-8 max-w-md mx-auto">
        {error.message || 'An unexpected error occurred while rendering this page.'}
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} className="gap-2">
          <RefreshCcw className="w-4 h-4" /> Try again
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/'}>
          Go Home
        </Button>
      </div>
    </div>
  );
}
