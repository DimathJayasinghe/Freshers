"use client";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PlusCircle, Save, GitBranch } from 'lucide-react';
import { toast } from 'sonner';
import { TournamentBracket, BracketRound, BracketMatch } from './TournamentBracket';
import { Faculty } from './ManageFaculties';

interface ManageBracketProps {
  sportName: string;
  faculties: Faculty[];
  onSave: (rounds: BracketRound[]) => void;
}

export function ManageBracket({ sportName, faculties, onSave }: ManageBracketProps) {
  const [rounds, setRounds] = useState<BracketRound[]>([
    {
      name: 'Semi Finals',
      matches: [
        { id: 'sf1', team1: null, team2: null },
        { id: 'sf2', team1: null, team2: null },
      ]
    },
    {
      name: 'Final',
      matches: [
        { id: 'final', team1: null, team2: null },
      ]
    }
  ]);

  const [selectedRound, setSelectedRound] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState(0);
  const [newRoundName, setNewRoundName] = useState('');

  const handleUpdateMatch = (field: 'team1' | 'team2' | 'time' | 'winner' | 'score1' | 'score2', value: string) => {
    setRounds(prev => {
      const newRounds = [...prev];
      const match = newRounds[selectedRound].matches[selectedMatch];
      
      if (field === 'team1') {
        const facultyName = faculties.find(f => f.id === parseInt(value))?.name || null;
        match.team1 = facultyName;
      } else if (field === 'team2') {
        const facultyName = faculties.find(f => f.id === parseInt(value))?.name || null;
        match.team2 = facultyName;
      } else if (field === 'time') {
        match.time = value;
      } else if (field === 'winner') {
        match.winner = value === 'none' ? undefined : value;
      } else if (field === 'score1') {
        match.score1 = parseInt(value) || undefined;
      } else if (field === 'score2') {
        match.score2 = parseInt(value) || undefined;
      }
      
      return newRounds;
    });
  };

  const handleAddRound = () => {
    if (newRoundName.trim() === '') {
      toast('Please enter a round name!');
      return;
    }
    const newRound: BracketRound = {
      name: newRoundName,
      matches: [{ id: `r${rounds.length + 1}m1`, team1: null, team2: null }]
    };
    setRounds([...rounds, newRound]);
    toast('Round added!');
    setNewRoundName('');
  };

  const handleAddMatch = () => {
    setRounds(prev => {
      const newRounds = [...prev];
      const currentRound = newRounds[selectedRound];
      currentRound.matches.push({
        id: `r${selectedRound}m${currentRound.matches.length + 1}`,
        team1: null,
        team2: null
      });
      return newRounds;
    });
    toast('Match added to round!');
  };

  const handleSave = () => {
    onSave(rounds);
    toast('Bracket saved successfully!');
  };

  const currentMatch = rounds[selectedRound]?.matches[selectedMatch];

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <GitBranch className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-green-900 mb-1">Setting up the tournament draw</p>
              <p className="text-green-800 text-sm">Configure the tournament bracket structure, assign teams to matches, and set match times. This draw will be visible to users when they click on matches.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg sticky top-4">
            <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-lg">
              <CardTitle className="text-white flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Configure Match
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Select Round</Label>
                <Select
                  value={selectedRound.toString()}
                  onValueChange={(value: string) => {
                    setSelectedRound(parseInt(value));
                    setSelectedMatch(0);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rounds.map((round, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {round.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Match</Label>
                <Select
                  value={selectedMatch.toString()}
                  onValueChange={(value: string) => setSelectedMatch(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rounds[selectedRound]?.matches.map((match, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        Match {index + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {currentMatch && (
                <>
                  <div className="space-y-2">
                    <Label>Team 1</Label>
                    <Select
                      value={faculties.find(f => f.name === currentMatch.team1)?.id.toString() || ''}
                      onValueChange={(value: string) => handleUpdateMatch('team1', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {faculties.map(faculty => (
                          <SelectItem key={faculty.id} value={faculty.id.toString()}>
                            {faculty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Team 2</Label>
                    <Select
                      value={faculties.find(f => f.name === currentMatch.team2)?.id.toString() || ''}
                      onValueChange={(value: string) => handleUpdateMatch('team2', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {faculties.map(faculty => (
                          <SelectItem key={faculty.id} value={faculty.id.toString()}>
                            {faculty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Match Time</Label>
                    <Input
                      type="time"
                      value={currentMatch.time || ''}
                      onChange={(e) => handleUpdateMatch('time', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Winner (if completed)</Label>
                    <Select
                      value={currentMatch.winner || 'none'}
                      onValueChange={(value: string) => handleUpdateMatch('winner', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select winner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {currentMatch.team1 && (
                          <SelectItem value={currentMatch.team1}>{currentMatch.team1}</SelectItem>
                        )}
                        {currentMatch.team2 && (
                          <SelectItem value={currentMatch.team2}>{currentMatch.team2}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="pt-4 space-y-2">
                <Button onClick={handleAddMatch} variant="outline" className="w-full">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Match to Round
                </Button>
                <div className="flex items-center">
                  <Input
                    type="text"
                    value={newRoundName}
                    onChange={(e) => setNewRoundName(e.target.value)}
                    placeholder="Enter new round name"
                    className="mr-2"
                  />
                  <Button onClick={handleAddRound} variant="outline" className="w-full">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add New Round
                  </Button>
                </div>
                <Button onClick={handleSave} className="w-full bg-green-500 hover:bg-green-600">
                  <Save className="w-4 h-4 mr-2" />
                  Save Bracket
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bracket Preview */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-blue-900">Tournament Bracket Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <TournamentBracket rounds={rounds} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}