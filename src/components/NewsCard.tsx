import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  date: string;
  category: string;
  imageUrl?: string;
  readTime: number;
}

interface NewsCardProps {
  article: NewsArticle;
  onClick: (article: NewsArticle) => void;
}

export const NewsCard = ({ article, onClick }: NewsCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card 
      className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-news-shadow/20 hover:bg-news-hover border-border/60 group"
      onClick={() => onClick(article)}
    >
      {article.imageUrl && (
        <div className="relative overflow-hidden rounded-t-lg">
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-background/90 text-news-text">
              {article.category}
            </Badge>
          </div>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4 text-sm text-news-subtle mb-2">
          <div className="flex items-center gap-1">
            <User size={14} />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{article.readTime} min read</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-news-header leading-tight line-clamp-3 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-news-text mb-4 line-clamp-3 leading-relaxed">
          {article.summary}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-news-subtle">
            {formatDate(article.date)}
          </span>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="text-primary hover:text-primary-foreground hover:bg-primary transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onClick(article);
            }}
          >
            Read More →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};