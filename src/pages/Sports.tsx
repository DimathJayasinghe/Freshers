import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, User, Waves, Activity, Search, ChevronDown } from "lucide-react";
import type { Sport } from "../data/sportsData";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { fetchSports, fetchResults } from "../lib/api";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Sports() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [resultsTab, setResultsTab] = useState<'with'|'all'>("with");
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sportsWithResults, setSportsWithResults] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    Promise.all([fetchSports(), fetchResults()])
      .then(([data, results]) => {
        if (!mounted) return;
        if (data && data.length > 0) setSports(data);
        const set = new Set<string>();
        (results || []).forEach(r => {
          const slug = (r.sport || '').toLowerCase().replace(/\s+/g, '-');
          if (slug) set.add(slug);
        });
        setSportsWithResults(set);
      })
      .catch((err) => console.error('[Sports] fetchSports error', err))
      .finally(() => { if (mounted) setLoading(false); });
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
  const categories = ["All", ...Array.from(new Set(sports.map(sport => sport.category)))];

  // Filter sports based on search, category, and results-only toggle
  const filteredSports = sports.filter(sport => {
    const matchesSearch = sport.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || sport.category === selectedCategory;
    const hasResults = sportsWithResults.has(sport.name.toLowerCase().replace(/\s+/g,'-'));
    const matchesResults = resultsTab === 'all' ? true : hasResults;
    return matchesSearch && matchesCategory && matchesResults;
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
              {loading ? (
                <span className="inline-block h-5 w-60 bg-white/10 rounded animate-pulse" />
              ) : (
                <>Browse all {sports.length} sports competing in UOC Freshers' Meet 2025</>
              )}
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

        {/* Category + Results Filters: Tabs on desktop, dropdowns on mobile */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Desktop/tablet tabs */}
          <div className="hidden sm:block flex-1">
            <Tabs value={selectedCategory} onValueChange={(v)=>setSelectedCategory(v)} className="flex-1">
              <TabsList className="bg-black/40 border border-white/10 text-gray-400 mx-auto sm:mx-0">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category} className="text-gray-400 data-[state=active]:text-red-400 data-[state=active]:bg-red-500/10">
                    <span className="mr-2">{category === 'All' ? <Trophy className="w-4 h-4" /> : getCategoryIcon(category)}</span>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <div className="hidden sm:block">
            <Tabs value={resultsTab} onValueChange={(v)=>setResultsTab(v as 'with'|'all')}>
              <TabsList className="bg-black/40 border border-white/10 text-gray-400">
                <TabsTrigger value="with" className="text-gray-400 data-[state=active]:text-green-400 data-[state=active]:bg-green-500/10">With Results</TabsTrigger>
                <TabsTrigger value="all" className="text-gray-400 data-[state=active]:text-blue-400 data-[state=active]:bg-blue-500/10">All Sports</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Mobile dropdowns */}
          <div className="block sm:hidden w-full space-y-3">
            <div className="relative">
              <select
                aria-label="Category"
                value={selectedCategory}
                onChange={(e)=>setSelectedCategory(e.target.value)}
                className="w-full appearance-none bg-black/50 backdrop-blur-md border border-white/10 text-white rounded-lg px-3 pr-9 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/50"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                aria-label="Results filter"
                value={resultsTab}
                onChange={(e)=>setResultsTab(e.target.value as 'with'|'all')}
                className="w-full appearance-none bg-black/50 backdrop-blur-md border border-white/10 text-white rounded-lg px-3 pr-9 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/50"
              >
                <option value="with">With Results</option>
                <option value="all">All Sports</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-400 text-sm">
          {loading ? (
            <span className="inline-block h-4 w-40 bg-white/10 rounded animate-pulse" />
          ) : (
            <>Showing {filteredSports.length} {filteredSports.length === 1 ? 'sport' : 'sports'}</>
          )}
        </p>
      </div>

      {/* Sports Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={`sp-skel-${idx}`} className="bg-black/40 backdrop-blur-xl border border-white/10 animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-6 w-40 bg-white/10 rounded mb-2" />
                    <div className="h-6 w-28 bg-white/10 rounded" />
                  </div>
                  <div className="w-8 h-8 bg-white/10 rounded" />
                </div>
                <div className="h-10 bg-white/10 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredSports.length > 0 ? (
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
                {(() => { const hasResults = sportsWithResults.has(sport.name.toLowerCase().replace(/\s+/g,'-')); return hasResults ? (
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">View Details</span>
                      <span className="text-red-400 group-hover:text-red-300">→</span>
                    </div>
                  </div>
                ) : null; })()}
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
