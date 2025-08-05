import { useNavigate } from "react-router-dom";
import { NewsCard, type NewsArticle } from "@/components/NewsCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Newspaper } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import axios from "axios";

const Index = () => {
  const navigate = useNavigate();
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  // Fetch articles from backend
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const url =
          searchTerm.trim() !== ""
            ? `http://localhost:5050/api/summaries/search/${encodeURIComponent(searchTerm)}`
            : `http://localhost:5050/api/summaries`;

        const response = await axios.get(url);
        setNewsArticles(response.data);
      } catch (err) {
        console.error("Error fetching articles", err);
        setNewsArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [searchTerm]);

  // Extract category list
  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(newsArticles.map(article => article.category || "General"))
    );
    return ["All", ...cats];
  }, [newsArticles]);

  // Filter by category (search is done server-side)
  const filteredArticles = useMemo(() => {
    return newsArticles.filter(article => {
      const matchesCategory =
        selectedCategory === "All" || article.category === selectedCategory;
      return matchesCategory;
    });
  }, [newsArticles, selectedCategory]);

  const handleArticleClick = (article: NewsArticle) => {
    navigate(`/article/${article.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/60 sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Newspaper className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-news-header">NewsHub</h1>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-news-subtle" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border/60"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-news-hover"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-news-header mb-4">
              Stay Informed with Latest News
            </h2>
            <p className="text-xl text-news-text leading-relaxed">
              Discover breaking news, in-depth analysis, and expert insights across technology, 
              environment, space, and health sectors.
            </p>
          </div>
        </section>

        {/* Articles Grid */}
        <section>
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📰</div>
              <h3 className="text-xl font-semibold text-news-header mb-2">No articles found</h3>
              <p className="text-news-subtle">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-news-header">
                  {selectedCategory === "All"
                    ? "Latest Articles"
                    : `${selectedCategory} News`}
                </h3>
                <span className="text-news-subtle">
                  {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    onClick={handleArticleClick}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border/60 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-news-subtle">
            <p>&copy; 2024 NewsHub. Stay informed, stay ahead.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
