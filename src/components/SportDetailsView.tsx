import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, Trophy, Calendar, MapPin, Users, Medal, Target } from 'lucide-react';
import { TournamentBracket } from './TournamentBracket';

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

interface Match {
  id: number;
  round: string;
  team1: string;
  team2: string;
  score1?: string;
  score2?: string;
  winner?: string;
  date: string;
  time: string;
  status: 'completed' | 'ongoing' | 'upcoming';
}

interface TeamStanding {
  position: number;
  team: string;
  played: number;
  won: number;
  lost: number;
  points: number;
  color: string;
}

interface SportDetailsViewProps {
  sport: Sport;
  onBack: () => void;
}

// Mock match data
const getMockMatches = (sportId: string): Match[] => {
  return [
    {
      id: 1,
      round: 'Final',
      team1: 'Faculty of Engineering',
      team2: 'Faculty of Science',
      score1: '185',
      score2: '162',
      winner: 'Faculty of Engineering',
      date: '2025-10-25',
      time: '14:00',
      status: 'completed'
    },
    {
      id: 2,
      round: 'Semi Final',
      team1: 'Faculty of Engineering',
      team2: 'Faculty of Medicine',
      score1: '210',
      score2: '195',
      winner: 'Faculty of Engineering',
      date: '2025-10-24',
      time: '10:00',
      status: 'completed'
    },
    {
      id: 3,
      round: 'Semi Final',
      team1: 'Faculty of Science',
      team2: 'Faculty of Arts',
      score1: '178',
      score2: '156',
      winner: 'Faculty of Science',
      date: '2025-10-24',
      time: '14:00',
      status: 'completed'
    },
    {
      id: 4,
      round: 'Quarter Final',
      team1: 'Faculty of Engineering',
      team2: 'Faculty of Management',
      score1: '195',
      score2: '142',
      winner: 'Faculty of Engineering',
      date: '2025-10-23',
      time: '10:00',
      status: 'completed'
    },
    {
      id: 5,
      round: 'Quarter Final',
      team1: 'Faculty of Medicine',
      team2: 'Faculty of Commerce',
      score1: '188',
      score2: '175',
      winner: 'Faculty of Medicine',
      date: '2025-10-23',
      time: '12:00',
      status: 'completed'
    },
    {
      id: 6,
      round: 'Quarter Final',
      team1: 'Faculty of Science',
      team2: 'Faculty of Law',
      score1: '202',
      score2: '168',
      winner: 'Faculty of Science',
      date: '2025-10-23',
      time: '14:00',
      status: 'completed'
    },
    {
      id: 7,
      round: 'Quarter Final',
      team1: 'Faculty of Arts',
      team2: 'Faculty of Agriculture',
      score1: '165',
      score2: '158',
      winner: 'Faculty of Arts',
      date: '2025-10-23',
      time: '16:00',
      status: 'completed'
    },
  ];
};

const getMockStandings = (sportId: string): TeamStanding[] => {
  return [
    {
      position: 1,
      team: 'Faculty of Engineering',
      played: 5,
      won: 5,
      lost: 0,
      points: 150,
      color: '#3b82f6'
    },
    {
      position: 2,
      team: 'Faculty of Science',
      played: 5,
      won: 4,
      lost: 1,
      points: 120,
      color: '#10b981'
    },
    {
      position: 3,
      team: 'Faculty of Medicine',
      played: 4,
      won: 3,
      lost: 1,
      points: 90,
      color: '#f59e0b'
    },
    {
      position: 4,
      team: 'Faculty of Arts',
      played: 4,
      won: 2,
      lost: 2,
      points: 60,
      color: '#8b5cf6'
    },
    {
      position: 5,
      team: 'Faculty of Management',
      played: 3,
      won: 1,
      lost: 2,
      points: 30,
      color: '#ec4899'
    },
  ];
};

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

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-500 text-white">Completed</Badge>;
    case 'ongoing':
      return <Badge className="bg-orange-500 text-white">Live</Badge>;
    case 'upcoming':
      return <Badge className="bg-gray-500 text-white">Upcoming</Badge>;
    default:
      return null;
  }
};

export function SportDetailsView({ sport, onBack }: SportDetailsViewProps) {
  const matches = getMockMatches(sport.id);
  const standings = getMockStandings(sport.id);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-4 text-white hover:bg-white/10 hover:translate-x-[-4px] transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sports
        </Button>
        
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{sport.icon}</div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-white">{sport.name}</h2>
                <Badge className={getCategoryBadgeColor(sport.category)}>
                  {getCategoryLabel(sport.category)}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{sport.venue}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  <span>{sport.completed}/{sport.totalMatches} matches</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Winners Section - Only show if completed */}
      {sport.status === 'completed' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {sport.winner && (
            <Card className="bg-gradient-to-br from-yellow-400 to-yellow-500 border-0 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-scale-in overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-yellow-600/20 to-transparent"></div>
              <CardContent className="p-6 text-center relative">
                <div className="text-5xl mb-3 animate-bounce">🥇</div>
                <p className="text-white/90 mb-1 text-sm uppercase tracking-wide">Champion</p>
                <h3 className="text-white font-semibold">{sport.winner}</h3>
              </CardContent>
            </Card>
          )}
          {sport.runnerUp && (
            <Card className="bg-gradient-to-br from-gray-300 to-gray-400 border-0 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-scale-in overflow-hidden relative" style={{ animationDelay: '0.1s' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-500/20 to-transparent"></div>
              <CardContent className="p-6 text-center relative">
                <div className="text-5xl mb-3">🥈</div>
                <p className="text-gray-700 mb-1 text-sm uppercase tracking-wide">Runner-up</p>
                <h3 className="text-gray-900 font-semibold">{sport.runnerUp}</h3>
              </CardContent>
            </Card>
          )}
          {sport.thirdPlace && (
            <Card className="bg-gradient-to-br from-orange-400 to-orange-500 border-0 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-scale-in overflow-hidden relative" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-orange-600/20 to-transparent"></div>
              <CardContent className="p-6 text-center relative">
                <div className="text-5xl mb-3">🥉</div>
                <p className="text-white/90 mb-1 text-sm uppercase tracking-wide">Third Place</p>
                <h3 className="text-white font-semibold">{sport.thirdPlace}</h3>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="bracket" className="w-full">
        <TabsList className="grid w-full max-w-xl mx-auto grid-cols-2 mb-8 h-auto p-1 bg-white shadow-md rounded-xl">
          <TabsTrigger 
            value="bracket" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-900 data-[state=active]:text-white rounded-lg transition-all"
          >
            <Target className="w-4 h-4" />
            <span>Draw</span>
          </TabsTrigger>

          <TabsTrigger 
            value="standings" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-900 data-[state=active]:text-white rounded-lg transition-all"
          >
            <Trophy className="w-4 h-4" />
            <span>Standings</span>
          </TabsTrigger>
        </TabsList>

        {/* Bracket Tab */}
        <TabsContent value="bracket">
          <h3 className="text-white mb-4">Tournament Draw</h3>
          <div className="bg-white rounded-lg p-6">
            <TournamentBracket sportKey={sport.id} />
          </div>
        </TabsContent>

        {/* Standings Tab */}
        <TabsContent value="standings">
          <h3 className="text-white mb-4">Team Standings</h3>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-900">Pos</th>
                      <th className="px-6 py-3 text-left text-gray-900">Team</th>
                      <th className="px-6 py-3 text-center text-gray-900">P</th>
                      <th className="px-6 py-3 text-center text-gray-900">W</th>
                      <th className="px-6 py-3 text-center text-gray-900">L</th>
                      <th className="px-6 py-3 text-center text-gray-900">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((standing, index) => (
                      <tr 
                        key={standing.team}
                        className={`border-t border-gray-100 ${index < 3 ? 'bg-blue-50/50' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {standing.position === 1 && <span>🥇</span>}
                            {standing.position === 2 && <span>🥈</span>}
                            {standing.position === 3 && <span>🥉</span>}
                            {standing.position > 3 && <span className="text-gray-600">{standing.position}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: standing.color }}
                            />
                            <span className="text-gray-900">{standing.team}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-900">{standing.played}</td>
                        <td className="px-6 py-4 text-center text-green-600">{standing.won}</td>
                        <td className="px-6 py-4 text-center text-red-600">{standing.lost}</td>
                        <td className="px-6 py-4 text-center text-blue-900">{standing.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>P</strong> - Played | <strong>W</strong> - Won | <strong>L</strong> - Lost | <strong>Pts</strong> - Points</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}