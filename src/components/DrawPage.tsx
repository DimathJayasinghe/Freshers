"use client";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Users } from 'lucide-react';
import { TournamentBracket, BracketRound } from './TournamentBracket';

const cricketDraw: BracketRound[] = [
  {
    name: 'Quarter Finals',
    matches: [
      { id: 'qf1', team1: 'Faculty of Engineering', team2: 'Faculty of Science', time: '09:00 AM', winner: 'Faculty of Engineering', score1: 185, score2: 162 },
      { id: 'qf2', team1: 'Faculty of Medicine', team2: 'Faculty of Arts', time: '11:00 AM', winner: 'Faculty of Medicine', score1: 156, score2: 142 },
      { id: 'qf3', team1: 'Faculty of Management', team2: 'Faculty of Law', time: '02:00 PM' },
      { id: 'qf4', team1: 'Faculty of Humanities', team2: 'Faculty of Agriculture', time: '04:00 PM' }
    ]
  },
  {
    name: 'Semi Finals',
    matches: [
      { id: 'sf1', team1: 'Faculty of Engineering', team2: 'Faculty of Medicine', time: 'Oct 25, 10:00 AM' },
      { id: 'sf2', team1: null, team2: null, time: 'Oct 25, 02:00 PM' }
    ]
  },
  {
    name: 'Final',
    matches: [
      { id: 'final', team1: null, team2: null, time: 'Oct 26, 03:00 PM' }
    ]
  }
];

const basketballDraw: BracketRound[] = [
  {
    name: 'Semi Finals',
    matches: [
      { id: 'sf1', team1: 'Faculty of Arts', team2: 'Faculty of Medicine', time: '11:30 AM' },
      { id: 'sf2', team1: 'Faculty of Engineering', team2: 'Faculty of Science', time: '01:30 PM' }
    ]
  },
  {
    name: 'Final',
    matches: [
      { id: 'final', team1: null, team2: null, time: 'Oct 25, 04:00 PM' }
    ]
  }
];

const footballDraw: BracketRound[] = [
  {
    name: 'Group Stage - Group A',
    matches: [
      { id: 'ga1', team1: 'Faculty of Science', team2: 'Faculty of Arts', time: '03:30 PM' },
      { id: 'ga2', team1: 'Faculty of Engineering', team2: 'Faculty of Management', time: 'Oct 25, 09:00 AM' }
    ]
  },
  {
    name: 'Group Stage - Group B',
    matches: [
      { id: 'gb1', team1: 'Faculty of Medicine', team2: 'Faculty of Law', time: 'Oct 25, 11:00 AM' },
      { id: 'gb2', team1: null, team2: null, time: 'Oct 25, 01:00 PM' }
    ]
  },
  {
    name: 'Finals',
    matches: [
      { id: 'final', team1: null, team2: null, time: 'Oct 26, 05:00 PM' }
    ]
  }
];

const sportDraws = {
  cricket: cricketDraw,
  basketball: basketballDraw,
  football: footballDraw
};

export function DrawPage() {
  const [selectedSport, setSelectedSport] = useState<keyof typeof sportDraws>('cricket');

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-white mb-2 bg-gradient-to-r from-blue-900 via-blue-700 to-green-500 bg-clip-text text-transparent">Tournament Draws</h2>
        <p className="text-gray-600">View tournament brackets and match progression</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
        </div>
      </div>

  <Tabs value={selectedSport} onValueChange={(value: string) => setSelectedSport(value as keyof typeof sportDraws)}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 bg-white shadow-lg rounded-xl p-1">
          <TabsTrigger value="cricket" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-900 data-[state=active]:to-blue-700 data-[state=active]:text-white rounded-lg transition-all duration-300">
            🏏 Cricket
          </TabsTrigger>
          <TabsTrigger value="basketball" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-900 data-[state=active]:to-blue-700 data-[state=active]:text-white rounded-lg transition-all duration-300">
            🏀 Basketball
          </TabsTrigger>
          <TabsTrigger value="football" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-900 data-[state=active]:to-blue-700 data-[state=active]:text-white rounded-lg transition-all duration-300">
            ⚽ Football
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cricket" className="mt-0 animate-fade-in">
          <div className="glass-card shadow-2xl overflow-hidden border-t-4 border-t-blue-500 rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
              <CardTitle className="text-white flex items-center gap-2">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                Cricket Tournament Bracket
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-gradient-to-br from-white/80 to-blue-50/50 backdrop-blur-sm">
              <TournamentBracket rounds={cricketDraw} />
            </CardContent>
          </div>
        </TabsContent>

        <TabsContent value="basketball" className="mt-0 animate-fade-in">
          <div className="glass-card shadow-2xl overflow-hidden border-t-4 border-t-orange-500 rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-orange-600 via-orange-700 to-orange-600 text-white">
              <CardTitle className="text-white flex items-center gap-2">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                Basketball Tournament Bracket
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-gradient-to-br from-white/80 to-orange-50/50 backdrop-blur-sm">
              <TournamentBracket rounds={basketballDraw} />
            </CardContent>
          </div>
        </TabsContent>

        <TabsContent value="football" className="mt-0 animate-fade-in">
          <div className="glass-card shadow-2xl overflow-hidden border-t-4 border-t-green-500 rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-green-700 via-green-800 to-green-700 text-white">
              <CardTitle className="text-white flex items-center gap-2">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                Football Tournament Bracket
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-gradient-to-br from-white/80 to-green-50/50 backdrop-blur-sm">
              <TournamentBracket rounds={footballDraw} />
            </CardContent>
          </div>
        </TabsContent>
      </Tabs>

      {/* Legend */}
      <div className="mt-8 glass-card shadow-lg border-2 border-white/30 animate-fade-in rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-gray-900 mb-4 text-center">Legend</h3>
          <div className="flex flex-wrap gap-6 justify-center">
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
              <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 border-2 border-green-600 rounded shadow-sm"></div>
              <span className="text-gray-700">Completed Match</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
              <div className="w-4 h-4 bg-white border-2 border-blue-400 rounded shadow-sm"></div>
              <span className="text-gray-700">Scheduled Match</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              <div className="w-4 h-4 bg-gray-100 border-2 border-dashed border-gray-400 rounded"></div>
              <span className="text-gray-700">To Be Decided</span>
            </div>
          </div>
        </CardContent>
      </div>
    </div>
  );
}
