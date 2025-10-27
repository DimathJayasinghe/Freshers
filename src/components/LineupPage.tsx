import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Clock, MapPin, Trophy } from 'lucide-react';

interface Match {
  id: number;
  sport: string;
  team1: string;
  team2: string;
  date: string;
  time: string;
  venue: string;
  status?: 'upcoming' | 'live' | 'completed';
  score1?: number;
  score2?: number;
}

// Helper function to get relative date
function getRelativeDate(dateString: string): string {
  const matchDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  
  matchDate.setHours(0, 0, 0, 0);
  
  if (matchDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (matchDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else if (matchDate.getTime() === dayAfterTomorrow.getTime()) {
    return 'Day After Tomorrow';
  } else {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    return matchDate.toLocaleDateString('en-US', options);
  }
}

export function LineupPage() {
  const getSportIcon = (sport: string) => {
    const icons: { [key: string]: string } = {
      'Cricket': '🏏',
      'Basketball': '🏀',
      'Volleyball': '🏐',
      'Football': '⚽',
    };
    return icons[sport] || '🏆';
  };

  const matches: Match[] = [
    { id: 1, sport: 'Cricket', team1: 'Faculty of Engineering', team2: 'Faculty of Science', date: '2025-10-24', time: '09:00', venue: 'Main Cricket Ground', status: 'live', score1: 145, score2: 132 },
    { id: 2, sport: 'Basketball', team1: 'Faculty of Arts', team2: 'Faculty of Medicine', date: '2025-10-24', time: '11:30', venue: 'Indoor Stadium Court 1', status: 'upcoming' },
    { id: 3, sport: 'Volleyball', team1: 'Faculty of Medicine', team2: 'Faculty of Management', date: '2025-10-25', time: '14:00', venue: 'Volleyball Court A', status: 'upcoming' },
    { id: 4, sport: 'Football', team1: 'Faculty of Science', team2: 'Faculty of Arts', date: '2025-10-25', time: '15:30', venue: 'Main Football Field', status: 'upcoming' },
    { id: 5, sport: 'Cricket', team1: 'Faculty of Medicine', team2: 'Faculty of Management', date: '2025-10-29', time: '10:00', venue: 'Main Cricket Ground', status: 'upcoming' },
    { id: 6, sport: 'Basketball', team1: 'Faculty of Engineering', team2: 'Faculty of Science', date: '2025-10-30', time: '16:00', venue: 'Indoor Stadium Court 2', status: 'upcoming' },
  ];

  // Group matches by date
  const groupedMatches = matches.reduce((acc, match) => {
    const dateKey = match.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  // Sort dates
  const sortedDates = Object.keys(groupedMatches).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-red-600 text-white animate-pulse">LIVE</Badge>;
      case 'completed':
        return <Badge className="bg-gray-600 text-white">Completed</Badge>;
      default:
        return <Badge className="bg-green-600 text-white">Upcoming</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-white mb-2 bg-gradient-to-r from-blue-900 via-blue-700 to-green-500 bg-clip-text text-transparent">Today's Lineup & Results</h2>
        <p className="text-gray-600">View upcoming matches and live scores</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
        </div>
      </div>

      <div className="space-y-6">
        {sortedDates.map((dateKey) => {
          const dayMatches = groupedMatches[dateKey];
          const relativeDate = getRelativeDate(dateKey);
          
          return (
            <div key={dateKey}>
              <div className="flex items-center gap-3 mb-4 animate-slide-in-right">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-lg shadow-md">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white">{relativeDate}</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-700 to-transparent"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dayMatches.map((match) => (
                  <Card key={match.id} className="glass-card shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border-l-4 border-l-blue-500 animate-scale-in">
                    <CardHeader className="pb-3 bg-gradient-to-r from-blue-50/50 to-white/50 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getSportIcon(match.sport)}</span>
                          <CardTitle className="text-blue-900">{match.sport}</CardTitle>
                        </div>
                        {getStatusBadge(match.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Teams */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg hover:shadow-md transition-shadow">
                            <span className="text-gray-900 font-medium">{match.team1}</span>
                            {match.status === 'live' && match.score1 !== undefined && (
                              <span className="text-blue-900 px-3 py-1 bg-white rounded-full shadow-sm">{match.score1}</span>
                            )}
                          </div>
                          <div className="flex items-center justify-center">
                            <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">VS</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg hover:shadow-md transition-shadow">
                            <span className="text-gray-900 font-medium">{match.team2}</span>
                            {match.status === 'live' && match.score2 !== undefined && (
                              <span className="text-blue-900 px-3 py-1 bg-white rounded-full shadow-sm">{match.score2}</span>
                            )}
                          </div>
                        </div>

                        {/* Match Details */}
                        <div className="flex flex-wrap gap-4 text-gray-600 pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{match.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{match.venue}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
