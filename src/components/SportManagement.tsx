"use client";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, GitBranch, Trophy, Save, Target } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ManageBracket } from './ManageBracket';
import { BracketRound, BracketMatch } from './TournamentBracket';
import { Faculty } from './ManageFaculties';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

interface SportManagementProps {
  sportName: string;
  onBack: () => void;
  faculties: Faculty[];
}

export function SportManagement({ sportName, onBack, faculties }: SportManagementProps) {
  const [bracketRounds, setBracketRounds] = useState<BracketRound[]>([]);
  const [editingMatch, setEditingMatch] = useState<{ 
    roundIndex: number; 
    matchIndex: number; 
    match: BracketMatch 
  } | null>(null);

  const handleSaveBracket = (rounds: BracketRound[]) => {
    setBracketRounds(rounds);
  };

  const handleMatchClick = (roundIndex: number, matchIndex: number) => {
    setEditingMatch({
      roundIndex,
      matchIndex,
      match: { ...bracketRounds[roundIndex].matches[matchIndex] }
    });
  };

  const handleUpdateMatchWinner = (winner: string) => {
    if (!editingMatch) return;
    
    setEditingMatch({
      ...editingMatch,
      match: { 
        ...editingMatch.match, 
        winner: winner === 'none' ? undefined : winner 
      }
    });
  };

  const handleUpdateMatchScore = (team: 'score1' | 'score2', value: string) => {
    if (!editingMatch) return;
    
    setEditingMatch({
      ...editingMatch,
      match: { 
        ...editingMatch.match, 
        [team]: value ? parseInt(value) : undefined 
      }
    });
  };

  const handleSaveMatchResult = () => {
    if (!editingMatch) return;

    const newRounds = [...bracketRounds];
    newRounds[editingMatch.roundIndex].matches[editingMatch.matchIndex] = editingMatch.match;
    setBracketRounds(newRounds);
    setEditingMatch(null);
    toast('Match result updated!');
  };

  const handleSaveAllResults = () => {
    toast('All results saved successfully!');
  };

  const renderMatch = (match: BracketMatch, roundIndex: number, matchIndex: number) => {
    const isTBD = !match.team1 || !match.team2;
    
    return (
      <div
        key={match.id}
        className={`relative bg-white rounded-lg border-2 p-3 transition-all cursor-pointer hover:shadow-lg ${
          match.winner
            ? 'border-green-500 bg-green-50'
            : isTBD
            ? 'border-dashed border-gray-300 bg-gray-50'
            : 'border-blue-300 hover:border-blue-500'
        }`}
        style={{ minWidth: '200px', minHeight: '100px' }}
        onClick={() => !isTBD && handleMatchClick(roundIndex, matchIndex)}
      >
        {match.time && (
          <Badge variant="outline" className="text-xs mb-2">
            {match.time}
          </Badge>
        )}
        
        {isTBD ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>TBD - Configure in Draw Setup</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div
              className={`p-2 rounded text-sm ${
                match.winner === match.team1
                  ? 'bg-blue-100 border-l-4 border-blue-900'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={match.winner === match.team1 ? 'text-blue-900' : 'text-gray-700'}>
                  {match.team1}
                </span>
                {match.score1 !== undefined && (
                  <span className="text-blue-900">{match.score1}</span>
                )}
              </div>
            </div>
            
            <div
              className={`p-2 rounded text-sm ${
                match.winner === match.team2
                  ? 'bg-blue-100 border-l-4 border-blue-900'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={match.winner === match.team2 ? 'text-blue-900' : 'text-gray-700'}>
                  {match.team2}
                </span>
                {match.score2 !== undefined && (
                  <span className="text-blue-900">{match.score2}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {match.winner && (
          <div className="absolute -top-2 -right-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 text-blue-900 hover:text-blue-800 hover:bg-blue-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h2 className="text-white mb-2">Manage {sportName}</h2>
        <p className="text-gray-600">Configure draw and update match results</p>
      </div>

      <Tabs defaultValue="draw" className="w-full">
        <TabsList className="grid w-full max-w-xl mx-auto grid-cols-2 mb-8 h-auto p-1 bg-white shadow-md rounded-xl">
          <TabsTrigger value="draw" className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-900 data-[state=active]:text-white rounded-lg">
            <GitBranch className="w-4 h-4" />
            Draw Setup
          </TabsTrigger>
          <TabsTrigger value="scores" className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-900 data-[state=active]:text-white rounded-lg">
            <Trophy className="w-4 h-4" />
            Update Results
          </TabsTrigger>
        </TabsList>

        {/* Info Card */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-900 mb-1">What users will see:</p>
                <p className="text-blue-800 text-sm">Users can click on live or scheduled matches to view the <strong>Draw</strong> tab (tournament bracket) and <strong>Standings</strong> tab. The Draw will be displayed by default.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Draw Setup Tab */}
        <TabsContent value="draw">
          <ManageBracket 
            sportName={sportName}
            faculties={faculties}
            onSave={handleSaveBracket}
          />
        </TabsContent>

        {/* Update Results Tab */}
        <TabsContent value="scores">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-lg">
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Tournament Bracket - Click to Update Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {bracketRounds.length === 0 ? (
                <div className="text-center py-12">
                  <GitBranch className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-2">No tournament bracket configured yet</p>
                  <p className="text-gray-400">Please set up the draw in the "Draw Setup" tab first</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto pb-4 mb-6">
                    <div className="flex gap-8 min-w-max">
                      {bracketRounds.map((round, roundIndex) => (
                        <div key={roundIndex} className="flex flex-col gap-4">
                          <div className="text-center mb-4">
                            <Badge className="bg-blue-900 text-white">{round.name}</Badge>
                          </div>
                          <div className="flex flex-col justify-around gap-6" style={{ minHeight: '400px' }}>
                            {round.matches.map((match, matchIndex) => (
                              <div key={match.id} className="flex items-center gap-4">
                                {renderMatch(match, roundIndex, matchIndex)}
                                {roundIndex < bracketRounds.length - 1 && (
                                  <svg width="40" height="100" className="flex-shrink-0">
                                    <line
                                      x1="0"
                                      y1="50"
                                      x2="40"
                                      y2="50"
                                      stroke="#cbd5e1"
                                      strokeWidth="2"
                                    />
                                  </svg>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button onClick={handleSaveAllResults} className="bg-green-500 hover:bg-green-600" size="lg">
                      <Save className="w-5 h-5 mr-2" />
                      Save All Results
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Match Result Dialog */}
  <Dialog open={editingMatch !== null} onOpenChange={(open: boolean) => !open && setEditingMatch(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Match Result</DialogTitle>
            <DialogDescription>
              Update the scores and winner for this match.
            </DialogDescription>
          </DialogHeader>
          {editingMatch && (
            <div className="space-y-6 py-4">
              {/* Teams Display */}
              <div className="text-center">
                <p className="text-gray-900 mb-1">
                  {editingMatch.match.team1} <span className="text-gray-500">vs</span> {editingMatch.match.team2}
                </p>
                {editingMatch.match.time && (
                  <Badge variant="outline" className="text-xs">
                    {editingMatch.match.time}
                  </Badge>
                )}
              </div>

              {/* Scores */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{editingMatch.match.team1}</Label>
                  <Input
                    type="number"
                    placeholder="Score"
                    value={editingMatch.match.score1 || ''}
                    onChange={(e) => handleUpdateMatchScore('score1', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{editingMatch.match.team2}</Label>
                  <Input
                    type="number"
                    placeholder="Score"
                    value={editingMatch.match.score2 || ''}
                    onChange={(e) => handleUpdateMatchScore('score2', e.target.value)}
                  />
                </div>
              </div>

              {/* Winner Selection */}
              <div className="space-y-2">
                <Label>Winner</Label>
                <Select
                  value={editingMatch.match.winner || 'none'}
                  onValueChange={handleUpdateMatchWinner}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select winner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Match Ongoing --</SelectItem>
                    <SelectItem value={editingMatch.match.team1!}>
                      {editingMatch.match.team1}
                    </SelectItem>
                    <SelectItem value={editingMatch.match.team2!}>
                      {editingMatch.match.team2}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingMatch(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveMatchResult} className="bg-blue-900 hover:bg-blue-800">
                  <Save className="w-4 h-4 mr-2" />
                  Save Result
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}