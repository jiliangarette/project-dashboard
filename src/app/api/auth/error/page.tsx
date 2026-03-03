"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Auto-redirect to demo mode
    router.push("/demo");
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-fg">Redirecting to Demo Mode...</p>
      </div>
    </div>
  );
}
