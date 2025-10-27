import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Trophy, Medal, Users, Calendar, Target, ChevronRight } from 'lucide-react';
import { SportDetailsView } from './SportDetailsView';

interface Sport {
  id: string;
  name: string;
  category: 'men' | 'women' | 'mixed';
  venue: string;
  totalMatches: number;
  completed: number;
  status: 'completed' | 'ongoing' | 'upcoming';
  icon: string;
  winner?: string;
  runnerUp?: string;
  thirdPlace?: string;
}

// Mock sports data
const sportsData: Sport[] = [
  {
    id: 'cricket-men',
    name: 'Cricket',
    category: 'men',
    venue: 'Main Ground',
    totalMatches: 15,
    completed: 15,
    status: 'completed',
    icon: '🏏',
    winner: 'Faculty of Engineering',
    runnerUp: 'Faculty of Science',
    thirdPlace: 'Faculty of Medicine'
  },
  {
    id: 'cricket-women',
    name: 'Cricket',
    category: 'women',
    venue: 'Main Ground',
    totalMatches: 12,
    completed: 12,
    status: 'completed',
    icon: '🏏',
    winner: 'Faculty of Engineering',
    runnerUp: 'Faculty of Science',
    thirdPlace: 'Faculty of Arts'
  },
  {
    id: 'basketball-men',
    name: 'Basketball',
    category: 'men',
    venue: 'Indoor Stadium',
    totalMatches: 10,
    completed: 10,
    status: 'completed',
    icon: '🏀',
    winner: 'Faculty of Science',
    runnerUp: 'Faculty of Engineering',
    thirdPlace: 'Faculty of Medicine'
  },
  {
    id: 'basketball-women',
    name: 'Basketball',
    category: 'women',
    venue: 'Indoor Stadium',
    totalMatches: 10,
    completed: 8,
    status: 'ongoing',
    icon: '🏀',
    winner: 'Faculty of Engineering',
    runnerUp: 'Faculty of Science'
  },
  {
    id: 'football-men',
    name: 'Football',
    category: 'men',
    venue: 'Football Ground',
    totalMatches: 12,
    completed: 12,
    status: 'completed',
    icon: '⚽',
    winner: 'Faculty of Engineering',
    runnerUp: 'Faculty of Arts',
    thirdPlace: 'Faculty of Management'
  },
  {
    id: 'volleyball-women',
    name: 'Volleyball',
    category: 'women',
    venue: 'Court A',
    totalMatches: 8,
    completed: 8,
    status: 'completed',
    icon: '🏐',
    winner: 'Faculty of Science',
    runnerUp: 'Faculty of Medicine',
    thirdPlace: 'Faculty of Engineering'
  },
  {
    id: 'badminton-men',
    name: 'Badminton',
    category: 'men',
    venue: 'Sports Complex',
    totalMatches: 10,
    completed: 6,
    status: 'ongoing',
    icon: '🏸'
  },
  {
    id: 'badminton-women',
    name: 'Badminton',
    category: 'women',
    venue: 'Sports Complex',
    totalMatches: 10,
    completed: 4,
    status: 'ongoing',
    icon: '🏸'
  },
  {
    id: 'tennis-mixed',
    name: 'Tennis',
    category: 'mixed',
    venue: 'Tennis Courts',
    totalMatches: 8,
    completed: 0,
    status: 'upcoming',
    icon: '🎾'
  },
];

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

const getStatusBadge = (status: string, completed: number, total: number) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-500 text-white">Completed</Badge>;
    case 'ongoing':
      return <Badge className="bg-orange-500 text-white">Ongoing ({completed}/{total})</Badge>;
    case 'upcoming':
      return <Badge className="bg-gray-500 text-white">Upcoming</Badge>;
    default:
      return null;
  }
};

interface SportCardProps {
  sport: Sport;
  onClick: () => void;
}

function SportCard({ sport, onClick }: SportCardProps) {
  return (
    <div 
      className="glass-card hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer group overflow-hidden relative animate-scale-in rounded-xl"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl transform group-hover:scale-110 transition-transform duration-300">{sport.icon}</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-gray-900">{sport.name}</h3>
                <Badge className={getCategoryBadgeColor(sport.category)}>
                  {getCategoryLabel(sport.category)}
                </Badge>
              </div>
              <p className="text-gray-600 text-sm">{sport.venue}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </div>

        <div className="flex items-center justify-between">
          {getStatusBadge(sport.status, sport.completed, sport.totalMatches)}
          
          {sport.winner && (
            <div className="flex items-center gap-1 text-sm">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-600 truncate max-w-[150px]">{sport.winner}</span>
            </div>
          )}
        </div>

        {sport.status === 'completed' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-yellow-600">🥇</span>
                <span className="text-gray-600 truncate">{sport.winner}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </div>
  );
}

export function SportResults() {
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const handleSportClick = (sport: Sport) => {
    setSelectedSport(sport);
  };

  const handleBackToList = () => {
    setSelectedSport(null);
  };

  // Filter sports by category
  const allSports = sportsData;
  const mensSports = sportsData.filter(s => s.category === 'men');
  const womensSports = sportsData.filter(s => s.category === 'women');
  const mixedSports = sportsData.filter(s => s.category === 'mixed');

  // Show sport details if selected
  if (selectedSport) {
    return <SportDetailsView sport={selectedSport} onBack={handleBackToList} />;
  }

  // Show sports list
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center animate-fade-in">
        <h2 className="text-white mb-2 bg-gradient-to-r from-blue-900 via-blue-700 to-green-500 bg-clip-text text-transparent">Sport-wise Results</h2>
        <p className="text-gray-600">Browse results and standings for each sport</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="glass-card border-blue-200 hover:shadow-lg transition-all duration-300 animate-fade-in rounded-xl">
          <CardContent className="p-6 text-center">
            <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <p className="text-blue-900 mb-1">{sportsData.length}</p>
            <p className="text-gray-600 text-sm">Total Sports</p>
          </CardContent>
        </div>
        <div className="glass-card border-green-200 hover:shadow-lg transition-all duration-300 animate-fade-in rounded-xl" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-6 text-center">
            <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
              <Medal className="w-6 h-6 text-white" />
            </div>
            <p className="text-green-600 mb-1">{sportsData.filter(s => s.status === 'completed').length}</p>
            <p className="text-gray-600 text-sm">Completed</p>
          </CardContent>
        </div>
        <div className="glass-card border-orange-200 hover:shadow-lg transition-all duration-300 animate-fade-in rounded-xl" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-6 text-center">
            <div className="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
              <Target className="w-6 h-6 text-white" />
            </div>
            <p className="text-orange-600 mb-1">{sportsData.filter(s => s.status === 'ongoing').length}</p>
            <p className="text-gray-600 text-sm">Ongoing</p>
          </CardContent>
        </div>
        <div className="glass-card border-purple-200 hover:shadow-lg transition-all duration-300 animate-fade-in rounded-xl" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-6 text-center">
            <div className="bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <p className="text-purple-600 mb-1">{sportsData.filter(s => s.status === 'upcoming').length}</p>
            <p className="text-gray-600 text-sm">Upcoming</p>
          </CardContent>
        </div>
      </div>

      {/* Sports Grid with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8 h-auto p-1 bg-white shadow-md rounded-xl">
          <TabsTrigger 
            value="all" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-900 data-[state=active]:text-white rounded-lg transition-all"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">All Sports</span>
            <span className="sm:hidden">All</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="mens" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-900 data-[state=active]:text-white rounded-lg transition-all"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Men's</span>
            <span className="sm:hidden">Men</span>
          </TabsTrigger>

          <TabsTrigger 
            value="womens" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-900 data-[state=active]:text-white rounded-lg transition-all"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Women's</span>
            <span className="sm:hidden">Women</span>
          </TabsTrigger>

          <TabsTrigger 
            value="mixed" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-900 data-[state=active]:text-white rounded-lg transition-all"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Mixed</span>
            <span className="sm:hidden">Mix</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allSports.map((sport) => (
              <SportCard key={sport.id} sport={sport} onClick={() => handleSportClick(sport)} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mens" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mensSports.map((sport) => (
              <SportCard key={sport.id} sport={sport} onClick={() => handleSportClick(sport)} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="womens" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {womensSports.map((sport) => (
              <SportCard key={sport.id} sport={sport} onClick={() => handleSportClick(sport)} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mixed" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mixedSports.length > 0 ? (
              mixedSports.map((sport) => (
                <SportCard key={sport.id} sport={sport} onClick={() => handleSportClick(sport)} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No mixed sports available</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
