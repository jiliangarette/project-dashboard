import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Illustration */}
        <div className="space-y-4">
          <h1 className="text-9xl font-bold text-foreground/10">404</h1>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Page Not Found</h2>
            <p className="text-lg text-muted-fg max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors font-medium shadow-lg"
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </Link>

          <Link
            href="/demo"
            className="flex items-center gap-2 px-6 py-3 bg-card-bg border border-card-border text-foreground rounded-lg hover:bg-foreground/5 transition-colors font-medium"
          >
            <Search className="w-5 h-5" />
            Try Demo Mode
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="pt-8 border-t border-card-border">
          <p className="text-sm text-muted-fg mb-4">Helpful links:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/"
              className="text-accent hover:underline"
            >
              Dashboard
            </Link>
            <Link
              href="/demo"
              className="text-accent hover:underline"
            >
              Demo
            </Link>
            <Link
              href="/settings"
              className="text-accent hover:underline"
            >
              Settings
            </Link>
            <a
              href="https://github.com/jiliangarette/project-dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              GitHub Repo
            </a>
          </div>
        </div>

        {/* Browser Back Button */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-sm text-muted-fg hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>
      </div>
    </div>
  );
}
