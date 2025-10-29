import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, User, Waves, Activity, Search } from "lucide-react";
import type { Sport } from "../data/sportsData";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchSports } from "../lib/api";

export function Sports() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sports, setSports] = useState<Sport[]>([]);

  useEffect(() => {
    let mounted = true;
    fetchSports()
      .then((data) => { if (mounted && data && data.length > 0) setSports(data); })
      .catch((err) => console.error('[Sports] fetchSports error', err));
    return () => { mounted = false; };
  }, []);

  const handleSportClick = (sportId: string) => {
    navigate(`/sport/${sportId}`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Team Sport':
        return <Users className="w-5 h-5" />;
      case 'Individual Sport':
        return <User className="w-5 h-5" />;
      case 'Athletics':
        return <Activity className="w-5 h-5" />;
      case 'Swimming':
        return <Waves className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Team Sport':
        return 'bg-red-600';
      case 'Individual Sport':
        return 'bg-yellow-600';
      case 'Athletics':
        return 'bg-green-600';
      case 'Swimming':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  // Get unique categories
  const categories = ["All", ...Array.from(new Set(sportsData.map(sport => sport.category)))];

  // Filter sports based on search and category
  const filteredSports = sportsData.filter(sport => {
    const matchesSearch = sport.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || sport.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-red-950 via-black to-red-950 py-12 md:py-16 border-b border-red-950">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/50 rounded-full px-4 py-2">
              <Trophy className="w-4 h-4 text-red-500" />
              <span className="text-red-400 text-sm font-semibold">All Sports</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Explore <span className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">Sports</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Browse all {sportsData.length} sports competing in UOC Freshers' Meet 2025
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search sports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-black/40 backdrop-blur-xl border border-white/10 text-white placeholder:text-gray-500 focus:border-red-500/50"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "default" : "outline"}
              className={
                selectedCategory === category
                  ? "bg-red-600 hover:bg-red-700 text-white border-red-500"
                  : "bg-black/40 backdrop-blur-xl border border-white/10 text-gray-300 hover:text-white hover:border-red-500/50 hover:bg-white/5"
              }
            >
              {category === "All" ? (
                <Trophy className="w-4 h-4 mr-2" />
              ) : (
                <span className="mr-2">{getCategoryIcon(category)}</span>
              )}
              {category}
              {category === "All" && (
                <span className="ml-2 px-2 py-0.5 bg-red-500/20 rounded-full text-xs">
                  {sportsData.length}
                </span>
              )}
              {category !== "All" && (
                <span className="ml-2 px-2 py-0.5 bg-white/10 rounded-full text-xs">
                  {sportsData.filter(s => s.category === category).length}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-400 text-sm">
          Showing {filteredSports.length} {filteredSports.length === 1 ? 'sport' : 'sports'}
        </p>
      </div>

      {/* Sports Grid */}
      {filteredSports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSports.map((sport) => (
            <Card
              key={sport.id}
              onClick={() => handleSportClick(sport.id)}
              className="bg-black/40 backdrop-blur-xl border border-white/10 hover:border-red-500/50 transition-all duration-300 cursor-pointer group"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors mb-2">
                      {sport.name}
                    </h3>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getCategoryColor(sport.category)} text-white text-xs font-medium`}>
                      {getCategoryIcon(sport.category)}
                      <span>{sport.category}</span>
                    </div>
                  </div>
                  <Trophy className="w-8 h-8 text-yellow-400 opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">View Details</span>
                    <span className="text-red-400 group-hover:text-red-300">→</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-black/40 backdrop-blur-xl border border-white/10">
          <CardContent className="p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No sports found</h3>
            <p className="text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
