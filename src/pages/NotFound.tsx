import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="glass-card max-w-md p-12 text-center">
        <p className="font-display text-6xl text-gradient">404</p>
        <h1 className="mt-4 text-xl font-semibold text-news-header">Page not found</h1>
        <p className="mt-2 text-sm text-news-subtle">
          We couldn't find <span className="text-news-text">{location.pathname}</span>.
        </p>
        <Link
          to="/"
          className="focus-ring mt-7 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background"
        >
          <ArrowLeft className="size-4" />
          Back to news
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
