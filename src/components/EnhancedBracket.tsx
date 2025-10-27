import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Trophy } from 'lucide-react';

interface Match {
  id: string;
  team1: string;
  team2: string;
  score1?: number;
  score2?: number;
  winner?: string;
  status: 'completed' | 'ongoing' | 'upcoming';
}

interface BracketRound {
  name: string;
  matches: Match[];
}

interface EnhancedBracketProps {
  rounds: BracketRound[];
  thirdPlaceMatch?: Match;
  finalMatch?: Match;
}

export function EnhancedBracket({ rounds, thirdPlaceMatch, finalMatch }: EnhancedBracketProps) {
  const MatchCard = ({ match, isSmall = false }: { match: Match; isSmall?: boolean }) => {
    const isWinner1 = match.winner === match.team1;
    const isWinner2 = match.winner === match.team2;

    return (
      <div className={`glass-card rounded-xl border-2 shadow-md hover:shadow-lg transition-all duration-300 ${
        match.status === 'completed' ? 'border-green-300' : 
        match.status === 'ongoing' ? 'border-orange-400 animate-pulse' : 
        'border-gray-300'
      } ${isSmall ? 'p-2' : 'p-3'}`}>
        {/* Team 1 */}
        <div className={`flex items-center justify-between ${isSmall ? 'p-1.5' : 'p-2'} rounded ${
          isWinner1 ? 'bg-green-100' : 'bg-white/50'
        }`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isWinner1 && <Trophy className="w-3 h-3 text-yellow-500 flex-shrink-0" />}
            <span className={`truncate text-sm ${isWinner1 ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
              {match.team1}
            </span>
          </div>
          {match.score1 !== undefined && (
            <span className={`ml-2 ${isSmall ? 'text-sm' : 'text-base'} font-mono ${isWinner1 ? 'font-bold' : ''}`}>
              {match.score1}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 my-1"></div>

        {/* Team 2 */}
        <div className={`flex items-center justify-between ${isSmall ? 'p-1.5' : 'p-2'} rounded ${
          isWinner2 ? 'bg-green-100' : 'bg-white/50'
        }`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isWinner2 && <Trophy className="w-3 h-3 text-yellow-500 flex-shrink-0" />}
            <span className={`truncate text-sm ${isWinner2 ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
              {match.team2}
            </span>
          </div>
          {match.score2 !== undefined && (
            <span className={`ml-2 ${isSmall ? 'text-sm' : 'text-base'} font-mono ${isWinner2 ? 'font-bold' : ''}`}>
              {match.score2}
            </span>
          )}
        </div>

        {/* Status Badge */}
        {match.status === 'ongoing' && (
          <div className="mt-2">
            <Badge className="w-full justify-center bg-orange-500 text-white text-xs">LIVE</Badge>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Regular Rounds (Quarters, Semis) */}
      <div className="flex gap-8 justify-center items-start overflow-x-auto pb-4">
        {rounds.map((round, roundIndex) => (
          <div key={roundIndex} className="flex-shrink-0">
            <div className="mb-6 text-center">
              <Badge className="bg-blue-600 text-white px-4 py-2">{round.name}</Badge>
            </div>
            <div className="space-y-12 min-w-[200px]">
              {round.matches.map((match) => (
                <div key={match.id} className="relative">
                  <MatchCard match={match} />
                  
                  {/* Connector Line to Next Round */}
                  {roundIndex < rounds.length - 1 && (
                    <svg className="absolute left-full top-1/2 transform -translate-y-1/2 pointer-events-none" width="32" height="2">
                      <line x1="0" y1="1" x2="32" y2="1" stroke="#cbd5e0" strokeWidth="2" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Finals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        {/* 3rd Place Playoff */}
        {thirdPlaceMatch && (
          <div className="glass-card rounded-2xl p-6 border-2 border-orange-300 shadow-xl">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg">
                <span className="text-xl">🥉</span>
              </div>
              <h3 className="text-gray-900">3rd Place Playoff</h3>
            </div>
            <MatchCard match={thirdPlaceMatch} />
          </div>
        )}

        {/* Final Match */}
        {finalMatch && (
          <div className="glass-card rounded-2xl p-6 border-2 border-yellow-300 shadow-xl">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6 text-yellow-900" />
              </div>
              <h3 className="text-gray-900">Grand Final</h3>
            </div>
            <MatchCard match={finalMatch} />
            
            {finalMatch.winner && (
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl text-center border-2 border-yellow-300">
                <p className="text-sm text-gray-600 mb-1">🏆 Champion 🏆</p>
                <p className="text-gray-900">{finalMatch.winner}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
