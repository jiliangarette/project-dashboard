"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

function AuthErrorContent() {
  const router = useRouter();

  useEffect(() => {
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

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-fg">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
