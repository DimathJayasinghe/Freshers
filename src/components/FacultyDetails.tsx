import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Trophy, Medal, X, TrendingUp, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface FacultyMatch {
  id: number;
  sport: string;
  category: 'men' | 'women' | 'mixed';
  opponent: string;
  result: 'win' | 'loss' | 'draw';
  score: string;
  date: string;
  medal?: 'gold' | 'silver' | 'bronze';
}

interface SportPerformance {
  sport: string;
  category: 'men' | 'women' | 'mixed';
  played: number;
  won: number;
  lost: number;
  draw: number;
  points: number;
  medal?: 'gold' | 'silver' | 'bronze';
}

interface FacultyDetailsProps {
  facultyName: string;
  facultyColor: string;
  totalScore: number;
  gold: number;
  silver: number;
  bronze: number;
  onClose: () => void;
}

// Mock data for matches - in real app this would come from props or API
const getMockMatches = (facultyName: string): FacultyMatch[] => {
  return [
    {
      id: 1,
      sport: 'Cricket',
      category: 'men',
      opponent: 'Faculty of Science',
      result: 'win',
      score: '185 - 162',
      date: '2025-10-24',
      medal: 'gold'
    },
    {
      id: 2,
      sport: 'Cricket',
      category: 'women',
      opponent: 'Faculty of Medicine',
      result: 'win',
      score: '142 - 138',
      date: '2025-10-24',
      medal: 'gold'
    },
    {
      id: 3,
      sport: 'Basketball',
      category: 'men',
      opponent: 'Faculty of Arts',
      result: 'win',
      score: '78 - 65',
      date: '2025-10-23',
      medal: 'silver'
    },
    {
      id: 4,
      sport: 'Basketball',
      category: 'women',
      opponent: 'Faculty of Science',
      result: 'loss',
      score: '62 - 68',
      date: '2025-10-23',
      medal: 'bronze'
    },
    {
      id: 5,
      sport: 'Football',
      category: 'men',
      opponent: 'Faculty of Management',
      result: 'win',
      score: '3 - 1',
      date: '2025-10-22',
      medal: 'gold'
    },
    {
      id: 6,
      sport: 'Volleyball',
      category: 'women',
      opponent: 'Faculty of Arts',
      result: 'draw',
      score: '2 - 2',
      date: '2025-10-22'
    },
  ];
};

const getMockSportPerformance = (facultyName: string): SportPerformance[] => {
  return [
    {
      sport: 'Cricket',
      category: 'men',
      played: 5,
      won: 4,
      lost: 1,
      draw: 0,
      points: 120,
      medal: 'gold'
    },
    {
      sport: 'Cricket',
      category: 'women',
      played: 4,
      won: 3,
      lost: 1,
      draw: 0,
      points: 90,
      medal: 'gold'
    },
    {
      sport: 'Basketball',
      category: 'men',
      played: 6,
      won: 4,
      lost: 2,
      draw: 0,
      points: 100,
      medal: 'silver'
    },
    {
      sport: 'Basketball',
      category: 'women',
      played: 5,
      won: 3,
      lost: 2,
      draw: 0,
      points: 75,
      medal: 'bronze'
    },
    {
      sport: 'Football',
      category: 'men',
      played: 4,
      won: 3,
      lost: 0,
      draw: 1,
      points: 85,
      medal: 'gold'
    },
    {
      sport: 'Volleyball',
      category: 'women',
      played: 3,
      won: 1,
      lost: 1,
      draw: 1,
      points: 55
    },
  ];
};

export function FacultyDetails({ 
  facultyName, 
  facultyColor, 
  totalScore, 
  gold, 
  silver, 
  bronze,
  onClose 
}: FacultyDetailsProps) {
  const matches = getMockMatches(facultyName);
  const sportPerformance = getMockSportPerformance(facultyName);

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'men':
        return 'bg-blue-500 text-white';
      case 'women':
        return 'bg-pink-500 text-white';
      case 'mixed':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'men':
        return "Men's";
      case 'women':
        return "Women's";
      case 'mixed':
        return 'Mixed';
      default:
        return category;
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'win':
        return <Badge className="bg-green-500 text-white">Win</Badge>;
      case 'loss':
        return <Badge className="bg-red-500 text-white">Loss</Badge>;
      case 'draw':
        return <Badge className="bg-gray-500 text-white">Draw</Badge>;
      default:
        return null;
    }
  };

  const getMedalBadge = (medal?: string) => {
    switch (medal) {
      case 'gold':
        return <span className="text-yellow-500">🥇</span>;
      case 'silver':
        return <span className="text-gray-500">🥈</span>;
      case 'bronze':
        return <span className="text-orange-500">🥉</span>;
      default:
        return null;
    }
  };

  const mensMatches = matches.filter(m => m.category === 'men');
  const womensMatches = matches.filter(m => m.category === 'women');
  const mensSports = sportPerformance.filter(s => s.category === 'men');
  const womensSports = sportPerformance.filter(s => s.category === 'women');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div 
          className="sticky top-0 z-10 p-6 text-white rounded-t-lg"
          style={{ background: `linear-gradient(135deg, ${facultyColor}, ${facultyColor}dd)` }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-white mb-2">{facultyName}</h2>
              <p className="text-white/90">Detailed Performance Report</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-white/90" />
              <p className="text-white mb-1">{totalScore}</p>
              <p className="text-white/80">Total Points</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🥇</div>
              <p className="text-white mb-1">{gold}</p>
              <p className="text-white/80">Gold Medals</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🥈</div>
              <p className="text-white mb-1">{silver}</p>
              <p className="text-white/80">Silver Medals</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🥉</div>
              <p className="text-white mb-1">{bronze}</p>
              <p className="text-white/80">Bronze Medals</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs defaultValue="overall" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overall">Overall</TabsTrigger>
              <TabsTrigger value="mens">Men's</TabsTrigger>
              <TabsTrigger value="womens">Women's</TabsTrigger>
            </TabsList>

            {/* Overall Tab */}
            <TabsContent value="overall" className="space-y-6">
              {/* Sport-wise Performance */}
              <div>
                <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-blue-900" />
                  Sport-wise Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sportPerformance.map((sport, index) => (
                    <Card key={index} className="border-l-4" style={{ borderColor: facultyColor }}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h4 className="text-gray-900">{sport.sport}</h4>
                            <Badge className={getCategoryBadgeColor(sport.category)}>
                              {getCategoryLabel(sport.category)}
                            </Badge>
                          </div>
                          {getMedalBadge(sport.medal)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Played:</span> <span className="text-gray-900">{sport.played}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Won:</span> <span className="text-green-600">{sport.won}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Lost:</span> <span className="text-red-600">{sport.lost}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Points:</span> <span className="text-blue-900">{sport.points}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Recent Matches */}
              <div>
                <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-900" />
                  Recent Matches
                </h3>
                <div className="space-y-3">
                  {matches.map((match) => (
                    <Card key={match.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-gray-900">{match.sport}</h4>
                              <Badge className={getCategoryBadgeColor(match.category)}>
                                {getCategoryLabel(match.category)}
                              </Badge>
                              {getMedalBadge(match.medal)}
                            </div>
                            <p className="text-gray-600">vs {match.opponent}</p>
                            <p className="text-gray-500 text-sm mt-1">{new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-gray-900">{match.score}</p>
                            </div>
                            {getResultBadge(match.result)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Men's Tab */}
            <TabsContent value="mens" className="space-y-6">
              <div>
                <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-blue-500" />
                  Men's Sport Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mensSports.map((sport, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-gray-900">{sport.sport}</h4>
                          {getMedalBadge(sport.medal)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Played:</span> <span className="text-gray-900">{sport.played}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Won:</span> <span className="text-green-600">{sport.won}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Lost:</span> <span className="text-red-600">{sport.lost}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Points:</span> <span className="text-blue-900">{sport.points}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Men's Matches
                </h3>
                <div className="space-y-3">
                  {mensMatches.map((match) => (
                    <Card key={match.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-gray-900">{match.sport}</h4>
                              {getMedalBadge(match.medal)}
                            </div>
                            <p className="text-gray-600">vs {match.opponent}</p>
                            <p className="text-gray-500 text-sm mt-1">{new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-gray-900">{match.score}</p>
                            </div>
                            {getResultBadge(match.result)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Women's Tab */}
            <TabsContent value="womens" className="space-y-6">
              <div>
                <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-pink-500" />
                  Women's Sport Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {womensSports.map((sport, index) => (
                    <Card key={index} className="border-l-4 border-l-pink-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-gray-900">{sport.sport}</h4>
                          {getMedalBadge(sport.medal)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Played:</span> <span className="text-gray-900">{sport.played}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Won:</span> <span className="text-green-600">{sport.won}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Lost:</span> <span className="text-red-600">{sport.lost}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Points:</span> <span className="text-blue-900">{sport.points}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-pink-500" />
                  Women's Matches
                </h3>
                <div className="space-y-3">
                  {womensMatches.map((match) => (
                    <Card key={match.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-gray-900">{match.sport}</h4>
                              {getMedalBadge(match.medal)}
                            </div>
                            <p className="text-gray-600">vs {match.opponent}</p>
                            <p className="text-gray-500 text-sm mt-1">{new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-gray-900">{match.score}</p>
                            </div>
                            {getResultBadge(match.result)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
