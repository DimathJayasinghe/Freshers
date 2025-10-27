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
        <h2 className="text-white mb-2 bg-gradient-to-r from-[var(--brand-primary)] via-[#7a251d] to-[var(--brand-accent)] bg-clip-text text-transparent">Tournament Draws</h2>
        <p className="text-white/70">View tournament brackets and match progression</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-[var(--brand-accent)] to-transparent rounded-full"></div>
        </div>
      </div>

  <Tabs value={selectedSport} onValueChange={(value: string) => setSelectedSport(value as keyof typeof sportDraws)}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 bg-[var(--brand-dark)]/60 border border-white/10 rounded-xl p-1">
          <TabsTrigger value="cricket" className="text-white/80 data-[state=active]:bg-[var(--brand-accent)] data-[state=active]:text-black rounded-lg transition-all duration-300">
            🏏 Cricket
          </TabsTrigger>
          <TabsTrigger value="basketball" className="text-white/80 data-[state=active]:bg-[var(--brand-accent)] data-[state=active]:text-black rounded-lg transition-all duration-300">
            🏀 Basketball
          </TabsTrigger>
          <TabsTrigger value="football" className="text-white/80 data-[state=active]:bg-[var(--brand-accent)] data-[state=active]:text-black rounded-lg transition-all duration-300">
            ⚽ Football
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cricket" className="mt-0 animate-fade-in">
          <div className="glass-card shadow-2xl overflow-hidden border-t-4 border-t-[var(--brand-accent)] rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-[var(--brand-dark)] via-[var(--brand-primary)] to-[var(--brand-dark)] text-white">
              <CardTitle className="text-white flex items-center gap-2">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                Cricket Tournament Bracket
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-[var(--brand-dark)]/40">
              <TournamentBracket rounds={cricketDraw} />
            </CardContent>
          </div>
        </TabsContent>

        <TabsContent value="basketball" className="mt-0 animate-fade-in">
          <div className="glass-card shadow-2xl overflow-hidden border-t-4 border-t-[var(--brand-accent)] rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-[var(--brand-dark)] via-[var(--brand-primary)] to-[var(--brand-dark)] text-white">
              <CardTitle className="text-white flex items-center gap-2">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                Basketball Tournament Bracket
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-[var(--brand-dark)]/40">
              <TournamentBracket rounds={basketballDraw} />
            </CardContent>
          </div>
        </TabsContent>

        <TabsContent value="football" className="mt-0 animate-fade-in">
          <div className="glass-card shadow-2xl overflow-hidden border-t-4 border-t-[var(--brand-accent)] rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-[var(--brand-dark)] via-[var(--brand-primary)] to-[var(--brand-dark)] text-white">
              <CardTitle className="text-white flex items-center gap-2">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                Football Tournament Bracket
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-[var(--brand-dark)]/40">
              <TournamentBracket rounds={footballDraw} />
            </CardContent>
          </div>
        </TabsContent>
      </Tabs>

      {/* Legend */}
      <div className="mt-8 glass-card shadow-lg border-2 border-white/20 animate-fade-in rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-white mb-4 text-center">Legend</h3>
          <div className="flex flex-wrap gap-6 justify-center">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-green-500/30">
              <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 border-2 border-green-600 rounded shadow-sm"></div>
              <span className="text-white/80">Completed Match</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-blue-400/30">
              <div className="w-4 h-4 bg-white/10 border-2 border-blue-400 rounded shadow-sm"></div>
              <span className="text-white/80">Scheduled Match</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/20">
              <div className="w-4 h-4 bg-white/10 border-2 border-dashed border-white/40 rounded"></div>
              <span className="text-white/80">To Be Decided</span>
            </div>
          </div>
        </CardContent>
      </div>
    </div>
  );
}
