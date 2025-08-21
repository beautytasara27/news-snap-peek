import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, User, Calendar } from "lucide-react";
import axios from "axios";

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  text: string;
  author: string;
  publishedAt: string;
  category: string;
  imageUrl?: string;
  readTime: number;
}

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
  
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5050/api/summaries/${id}`);
        console.log("single article", response)
        setArticle(response.data.data[0]); 
      } catch (err) {
        console.error("Error fetching article:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
  
    fetchArticle();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-news-subtle">Loading article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-news-header mb-4">
            Article Not Found
          </h1>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to News
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/60 sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-4">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            size="sm"
            className="text-news-text hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to News
          </Button>
        </div>
      </header>

      {/* Article Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Badge
            variant="secondary"
            className="mb-4 bg-primary/10 text-primary"
          >
            {article.category}
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold text-news-header mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-news-subtle border-b border-border/60 pb-6">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span className="font-medium">{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{formatDate(article.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{article.readTime} min read</span>
            </div>
          </div>
        </div>

        {article.imageUrl && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>
        )}

        <div className="mb-8 p-6 bg-muted/50 rounded-lg border-l-4 border-primary">
          <p className="text-lg text-news-text leading-relaxed font-medium">
            {article.summary}
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="text-news-text leading-relaxed text-lg space-y-6">
            {article.text.split("\n").map((paragraph, index) => (
              <p key={index} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-12 p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-border/60">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-news-header mb-2">
              Stay Updated
            </h3>
            <p className="text-news-subtle mb-4">
              Get the latest news and insights delivered straight to your inbox.
            </p>
            <Button className="bg-primary hover:bg-primary/90">
              Subscribe to Newsletter
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewsDetail;
