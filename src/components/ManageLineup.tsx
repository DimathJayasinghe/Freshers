"use client";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { PlusCircle, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Faculty } from './ManageFaculties';
import { SportType } from './ManageSportsTypes';

interface LineupMatch {
  id: number;
  sport: string;
  team1: string;
  team2: string;
  date: string;
  time: string;
  venue: string;
}

interface ManageLineupProps {
  sports: SportType[];
  faculties: Faculty[];
}

export function ManageLineup({ sports, faculties }: ManageLineupProps) {
  const [lineups, setLineups] = useState<LineupMatch[]>([
    { id: 1, sport: "Cricket (Men's)", team1: 'Faculty of Engineering', team2: 'Faculty of Science', date: '2025-10-29', time: '09:00', venue: 'Main Cricket Ground' },
    { id: 2, sport: "Volleyball (Women's)", team1: 'Faculty of Medicine', team2: 'Faculty of Arts', date: '2025-10-25', time: '14:00', venue: 'Volleyball Court A' },
  ]);

  const [newLineup, setNewLineup] = useState({
    sport: '',
    team1: '',
    team2: '',
    date: '',
    time: '',
    venue: ''
  });

  const handleAddLineup = () => {
    if (!newLineup.sport || !newLineup.team1 || !newLineup.team2 || !newLineup.date || !newLineup.time) {
      toast('Please fill in all required fields');
      return;
    }

    const match: LineupMatch = {
      id: lineups.length + 1,
      ...newLineup
    };

    setLineups([...lineups, match]);
    setNewLineup({ sport: '', team1: '', team2: '', date: '', time: '', venue: '' });
    toast('Match added to lineup!');
  };

  const handleDeleteLineup = (id: number) => {
    setLineups(lineups.filter(m => m.id !== id));
    toast('Match removed from lineup');
  };

  const getSportDisplayName = (sport: SportType) => {
    const categoryLabel = sport.category === 'men' ? "Men's" : sport.category === 'women' ? "Women's" : "Mixed";
    return `${sport.name} (${categoryLabel})`;
  };

  const handleSportChange = (sportKey: string) => {
    const sport = sports.find(s => getSportDisplayName(s) === sportKey);
    setNewLineup({ ...newLineup, sport: sportKey, venue: sport?.venue || '' });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-white mb-2">Manage Daily Lineup</h2>
        <p className="text-gray-600">Schedule and organize upcoming matches</p>
      </div>

      <Card className="shadow-lg mb-6">
        <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-lg">
          <CardTitle className="text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Add Match to Lineup
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Sport *</Label>
              <Select value={newLineup.sport} onValueChange={handleSportChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent>
                  {sports.map(sport => (
                    <SelectItem key={sport.id} value={getSportDisplayName(sport)}>
                      {getSportDisplayName(sport)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Team 1 *</Label>
              <Select value={newLineup.team1} onValueChange={(value: string) => setNewLineup({ ...newLineup, team1: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map(faculty => (
                    <SelectItem key={faculty.id} value={faculty.name}>{faculty.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Team 2 *</Label>
              <Select value={newLineup.team2} onValueChange={(value: string) => setNewLineup({ ...newLineup, team2: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map(faculty => (
                    <SelectItem key={faculty.id} value={faculty.name}>{faculty.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={newLineup.date}
                onChange={(e) => setNewLineup({ ...newLineup, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Time *</Label>
              <Input
                type="time"
                value={newLineup.time}
                onChange={(e) => setNewLineup({ ...newLineup, time: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Venue</Label>
              <Input
                placeholder="Venue"
                value={newLineup.venue}
                onChange={(e) => setNewLineup({ ...newLineup, venue: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleAddLineup} className="bg-green-500 hover:bg-green-600">
            <PlusCircle className="w-4 h-4 mr-2" />
            Add to Lineup
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Scheduled Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sport</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No matches scheduled yet
                    </TableCell>
                  </TableRow>
                ) : (
                  lineups.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell>
                        <Badge className="bg-blue-900">{match.sport}</Badge>
                      </TableCell>
                      <TableCell>{match.team1} vs {match.team2}</TableCell>
                      <TableCell>{new Date(match.date).toLocaleDateString()}</TableCell>
                      <TableCell>{match.time}</TableCell>
                      <TableCell>{match.venue}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLineup(match.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
