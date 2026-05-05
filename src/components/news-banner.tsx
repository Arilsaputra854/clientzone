"use client";

import { useEffect, useState } from "react";
import { 
  AlertCircle, 
  Info, 
  Wrench, 
  X,
  ChevronRight,
  Megaphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function NewsBanner() {
  const [news, setNews] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/news?active=true");
        const data = await res.json();
        setNews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch news:", error);
      }
    };
    fetchNews();
  }, []);

  if (!isVisible || news.length === 0) return null;

  const currentNews = news[currentIndex];

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "MAINTENANCE":
        return "bg-amber-500/10 border-amber-500/20 text-amber-500 icon-amber-500";
      case "ALERT":
        return "bg-red-500/10 border-red-500/20 text-red-500 icon-red-500";
      default:
        return "bg-[#1a73e8]/10 border-[#1a73e8]/20 text-[#1a73e8] icon-[#1a73e8]";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "MAINTENANCE": return <Wrench className="w-4 h-4" />;
      case "ALERT": return <AlertCircle className="w-4 h-4" />;
      default: return <Megaphone className="w-4 h-4" />;
    }
  };

  return (
    <div className={cn(
      "w-full border-b transition-all duration-500 animate-in slide-in-from-top",
      getTypeStyles(currentNews.type)
    )}>
      <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {getTypeIcon(currentNews.type)}
          </div>
          <p className="text-sm font-bold truncate">
            <span className="uppercase text-[10px] mr-2 opacity-70">[{currentNews.type}]</span>
            {currentNews.title}: <span className="font-medium opacity-90">{currentNews.content}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {news.length > 1 && (
            <div className="flex items-center gap-1 mr-4">
              {news.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-1 h-1 rounded-full transition-all",
                    i === currentIndex ? "w-3 bg-current" : "bg-current/30"
                  )}
                />
              ))}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 hover:bg-current/10 ml-2"
                onClick={() => setCurrentIndex((currentIndex + 1) % news.length)}
              >
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-current/10"
            onClick={() => setIsVisible(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
