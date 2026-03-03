"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";

export default function ErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    // Auto-redirect OAuth errors to demo mode
    if (error === "Configuration" || error === "OAuthCallback") {
      const timer = setTimeout(() => {
        router.push("/demo");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <AlertCircle className="w-16 h-16 mx-auto text-destructive" />
        <h1 className="text-2xl font-bold text-foreground">
          {error === "Configuration" || error === "OAuthCallback"
            ? "OAuth Not Configured"
            : "Authentication Error"}
        </h1>
        <p className="text-muted-fg">
          {error === "Configuration" || error === "OAuthCallback" ? (
            <>
              GitHub OAuth is not set up yet.
              <br />
              <span className="text-accent font-medium">
                Redirecting to Demo Mode...
              </span>
            </>
          ) : (
            <>An error occurred during authentication. Please try again.</>
          )}
        </p>
        {(error === "Configuration" || error === "OAuthCallback") && (
          <button
            onClick={() => router.push("/demo")}
            className="mt-4 px-6 py-3 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors"
          >
            Go to Demo Now
          </button>
        )}
      </div>
    </div>
  );
}
