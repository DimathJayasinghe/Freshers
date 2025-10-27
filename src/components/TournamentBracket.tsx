import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Trophy, Clock } from 'lucide-react';

export interface BracketMatch {
  id: string;
  team1: string | null;
  team2: string | null;
  winner?: string;
  score1?: number;
  score2?: number;
  time?: string;
}

export interface BracketRound {
  name: string;
  matches: BracketMatch[];
}

interface TournamentBracketProps {
  rounds?: BracketRound[];
  sportKey?: string;
}

// Generate mock bracket data
const generateMockBracket = (sportKey?: string): BracketRound[] => {
  return [
    {
      name: 'Quarter Finals',
      matches: [
        {
          id: 'qf1',
          team1: 'Faculty of Engineering',
          team2: 'Faculty of Management',
          winner: 'Faculty of Engineering',
          score1: 195,
          score2: 142,
          time: '10:00 AM'
        },
        {
          id: 'qf2',
          team1: 'Faculty of Medicine',
          team2: 'Faculty of Commerce',
          winner: 'Faculty of Medicine',
          score1: 188,
          score2: 175,
          time: '12:00 PM'
        },
        {
          id: 'qf3',
          team1: 'Faculty of Science',
          team2: 'Faculty of Law',
          winner: 'Faculty of Science',
          score1: 202,
          score2: 168,
          time: '2:00 PM'
        },
        {
          id: 'qf4',
          team1: 'Faculty of Arts',
          team2: 'Faculty of Agriculture',
          winner: 'Faculty of Arts',
          score1: 165,
          score2: 158,
          time: '4:00 PM'
        },
      ],
    },
    {
      name: 'Semi Finals',
      matches: [
        {
          id: 'sf1',
          team1: 'Faculty of Engineering',
          team2: 'Faculty of Medicine',
          winner: 'Faculty of Engineering',
          score1: 210,
          score2: 195,
          time: '10:00 AM'
        },
        {
          id: 'sf2',
          team1: 'Faculty of Science',
          team2: 'Faculty of Arts',
          winner: 'Faculty of Science',
          score1: 178,
          score2: 156,
          time: '2:00 PM'
        },
      ],
    },
    {
      name: 'Final',
      matches: [
        {
          id: 'final',
          team1: 'Faculty of Engineering',
          team2: 'Faculty of Science',
          winner: 'Faculty of Engineering',
          score1: 185,
          score2: 162,
          time: '2:00 PM'
        },
      ],
    },
  ];
};

export function TournamentBracket({ rounds, sportKey }: TournamentBracketProps) {
  const bracketRounds = rounds || generateMockBracket(sportKey);

  const renderMatch = (match: BracketMatch, roundIndex: number, matchIndex: number) => {
    const isTBD = !match.team1 || !match.team2;
    const isFinal = roundIndex === bracketRounds.length - 1;
    
    return (
      <div
        className={`relative glass-card rounded-lg border shadow-md hover:shadow-lg transition-all duration-300 ${
          match.winner
            ? 'border-[var(--brand-accent)] bg-gradient-to-br from-[var(--brand-primary)]/55 to-[var(--brand-dark)]/55 text-white'
            : isTBD
            ? 'border-dashed border-white/20 bg-white/5'
            : 'border-white/15 hover:border-white/30'
        } ${isFinal ? 'ring-2 ring-[var(--brand-accent)] ring-offset-2 ring-offset-[var(--brand-dark)]' : ''}`}
        style={{ width: '280px', minHeight: '120px' }}
      >
        <div className="p-4">
          {/* Match header */}
          <div className="flex items-center justify-between mb-3">
            {match.time && (
              <Badge variant="outline" className="text-xs flex items-center gap-1 bg-[var(--brand-accent)]/20 text-[var(--brand-accent)] border border-[var(--brand-accent)]/30">
                <Clock className="w-3 h-3" />
                {match.time}
              </Badge>
            )}
            {isFinal && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 border-0">
                🏆 Final
              </Badge>
            )}
          </div>
          
          {isTBD ? (
            <div className="flex items-center justify-center h-20">
              <div className="text-center">
                <p className="text-gray-400">To Be Decided</p>
                <p className="text-xs text-gray-400 mt-1">Awaiting results</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Team 1 */}
              <div
                className={`group relative p-3 rounded-lg transition-all duration-300 ${
                  match.winner === match.team1
                    ? 'bg-gradient-to-r from-[var(--brand-primary)] to-[#7a251d] text-white shadow-md transform scale-105'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {match.winner === match.team1 && (
                      <Trophy className="w-4 h-4 text-yellow-300 flex-shrink-0 animate-pulse" />
                    )}
                    <span className={`truncate ${match.winner === match.team1 ? 'font-semibold' : 'text-white/90'}`}>
                      {match.team1}
                    </span>
                  </div>
                  {match.score1 !== undefined && (
                    <span className={`ml-2 px-2 py-1 rounded text-sm font-semibold ${
                      match.winner === match.team1 ? 'bg-white/20 text-white' : 'bg-white/10 text-white/90'
                    }`}>
                      {match.score1}
                    </span>
                  )}
                </div>
              </div>
              
              {/* VS Divider */}
              <div className="flex items-center justify-center">
                <div className="text-xs text-white/60 px-2 py-0.5 rounded-full bg-white/10">
                  VS
                </div>
              </div>
              
              {/* Team 2 */}
              <div
                className={`group relative p-3 rounded-lg transition-all duration-300 ${
                  match.winner === match.team2
                    ? 'bg-gradient-to-r from-[var(--brand-primary)] to-[#7a251d] text-white shadow-md transform scale-105'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {match.winner === match.team2 && (
                      <Trophy className="w-4 h-4 text-yellow-300 flex-shrink-0 animate-pulse" />
                    )}
                    <span className={`truncate ${match.winner === match.team2 ? 'font-semibold' : 'text-white/90'}`}>
                      {match.team2}
                    </span>
                  </div>
                  {match.score2 !== undefined && (
                    <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${
                      match.winner === match.team2 ? 'bg-white/20 text-white' : 'bg-white/10 text-white/90'
                    }`}>
                      {match.score2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Winner indicator */}
        {match.winner && !isFinal && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
            <Trophy className="w-4 h-4" />
          </div>
        )}

        {/* Final winner special indicator */}
        {match.winner && isFinal && (
          <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-900 rounded-full p-2 shadow-lg animate-pulse">
            <Trophy className="w-5 h-5" />
          </div>
        )}
      </div>
    );
  };

  // Calculate connector positions
  const getConnectorHeight = (roundIndex: number, totalMatches: number) => {
    const baseSpacing = 160; // Base spacing between matches
    const multiplier = Math.pow(2, roundIndex); // Exponential spacing
    return baseSpacing * multiplier;
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto pb-8 pt-4">
        <div className="inline-flex gap-16 px-8" style={{ minWidth: 'fit-content' }}>
          {bracketRounds.map((round, roundIndex) => {
            const matchSpacing = getConnectorHeight(roundIndex, round.matches.length);
            
            return (
              <div key={roundIndex} className="relative flex flex-col">
                {/* Round Header */}
                <div className="text-center mb-6 sticky top-0 z-10 bg-[var(--brand-dark)]/80 backdrop-blur border border-white/10 py-2 rounded-lg shadow-sm">
                  <Badge className="bg-gradient-to-r from-[var(--brand-primary)] to-[#7a251d] text-white px-6 py-2 text-sm shadow-md">
                    {round.name}
                  </Badge>
                  <p className="text-xs text-white/60 mt-1">{round.matches.length} {round.matches.length === 1 ? 'Match' : 'Matches'}</p>
                </div>
                
                {/* Matches */}
                <div className="flex flex-col justify-around gap-8" style={{ minHeight: '600px' }}>
                  {round.matches.map((match, matchIndex) => (
                    <div key={match.id} className="relative flex items-center" style={{ 
                      marginTop: roundIndex > 0 ? `${matchIndex * matchSpacing / round.matches.length}px` : '0'
                    }}>
                      {/* Match Card */}
                      <div className="animate-fade-in" style={{ animationDelay: `${(roundIndex * 0.1) + (matchIndex * 0.05)}s` }}>
                        {renderMatch(match, roundIndex, matchIndex)}
                      </div>
                      
                      {/* Connector Lines */}
                      {roundIndex < bracketRounds.length - 1 && (
                        <svg
                          className="absolute left-full ml-0"
                          width="64"
                          height={matchSpacing}
                          style={{
                            top: matchIndex % 2 === 0 ? '50%' : `calc(-${matchSpacing}px + 50%)`,
                          }}
                        >
                          {/* Horizontal line from match */}
                          <line
                            x1="0"
                            y1={matchIndex % 2 === 0 ? "0" : matchSpacing}
                            x2="32"
                            y2={matchIndex % 2 === 0 ? "0" : matchSpacing}
                            stroke={match.winner ? "#c99908" : "rgba(255,255,255,0.3)"}
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                          
                          {/* Vertical connecting line */}
                          <line
                            x1="32"
                            y1={matchIndex % 2 === 0 ? "0" : matchSpacing}
                            x2="32"
                            y2={matchSpacing / 2}
                            stroke={match.winner ? "#c99908" : "rgba(255,255,255,0.3)"}
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                          
                          {/* Horizontal line to next round */}
                          {matchIndex % 2 === 1 && (
                            <line
                              x1="32"
                              y1={matchSpacing / 2}
                              x2="64"
                              y2={matchSpacing / 2}
                              stroke={match.winner ? "#c99908" : "rgba(255,255,255,0.3)"}
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                          )}
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
