"use client";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { PlusCircle, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface Match {
  id: number;
  sport: string;
  team1: string;
  team2: string;
  time: string;
  location: string;
  score1: string;
  score2: string;
  winner: string;
}

const sports = ['Cricket', 'Football', 'Basketball', 'Volleyball', 'Badminton', 'Tennis', 'Table Tennis', 'Athletics'];
const faculties = [
  'Faculty of Engineering',
  'Faculty of Science',
  'Faculty of Medicine',
  'Faculty of Arts',
  'Faculty of Management'
];

export function AddSportsPage() {
  const [matches, setMatches] = useState<Match[]>([
    {
      id: 1,
      sport: 'Cricket',
      team1: 'Faculty of Engineering',
      team2: 'Faculty of Science',
      time: '09:00 AM',
      location: 'Main Cricket Ground',
      score1: '185',
      score2: '162',
      winner: 'Faculty of Engineering'
    }
  ]);

  const [formData, setFormData] = useState({
    sport: '',
    team1: '',
    team2: '',
    time: '',
    location: '',
    score1: '',
    score2: '',
    winner: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddMatch = () => {
    if (!formData.sport || !formData.team1 || !formData.team2 || !formData.time || !formData.location) {
      toast('Please fill in all required fields');
      return;
    }

    const newMatch: Match = {
      id: matches.length + 1,
      ...formData
    };

    setMatches(prev => [...prev, newMatch]);
    setFormData({
      sport: '',
      team1: '',
      team2: '',
      time: '',
      location: '',
      score1: '',
      score2: '',
      winner: ''
    });
    
    toast('Match added successfully!');
  };

  const handleDeleteMatch = (id: number) => {
    setMatches(prev => prev.filter(match => match.id !== id));
    toast('Match deleted');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-white mb-2">Add Sports Details</h2>
        <p className="text-gray-600">Enter match information and results</p>
      </div>

      {/* Add Match Form */}
      <Card className="mb-8 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-lg">
          <CardTitle className="text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            New Match Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sport Selection */}
            <div className="space-y-2">
              <Label htmlFor="sport">Sport *</Label>
              <Select value={formData.sport} onValueChange={(value: string) => handleInputChange('sport', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent>
                  {sports.map((sport: string) => (
                    <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time */}
            <div className="space-y-2">
              <Label htmlFor="time">Match Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
              />
            </div>

            {/* Team 1 */}
            <div className="space-y-2">
              <Label htmlFor="team1">Team 1 *</Label>
              <Select value={formData.team1} onValueChange={(value: string) => handleInputChange('team1', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map(faculty => (
                    <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Team 2 */}
            <div className="space-y-2">
              <Label htmlFor="team2">Team 2 *</Label>
              <Select value={formData.team2} onValueChange={(value: string) => handleInputChange('team2', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map(faculty => (
                    <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Main Cricket Ground"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>

            {/* Score 1 */}
            <div className="space-y-2">
              <Label htmlFor="score1">Team 1 Score</Label>
              <Input
                id="score1"
                type="number"
                placeholder="Enter score"
                value={formData.score1}
                onChange={(e) => handleInputChange('score1', e.target.value)}
              />
            </div>

            {/* Score 2 */}
            <div className="space-y-2">
              <Label htmlFor="score2">Team 2 Score</Label>
              <Input
                id="score2"
                type="number"
                placeholder="Enter score"
                value={formData.score2}
                onChange={(e) => handleInputChange('score2', e.target.value)}
              />
            </div>

            {/* Winner */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="winner">Winner</Label>
              <Select value={formData.winner} onValueChange={(value: string) => handleInputChange('winner', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select winner (if completed)" />
                </SelectTrigger>
                <SelectContent>
                  {formData.team1 && <SelectItem value={formData.team1}>{formData.team1}</SelectItem>}
                  {formData.team2 && <SelectItem value={formData.team2}>{formData.team2}</SelectItem>}
                  <SelectItem value="Draw">Draw</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Optional: Upload Poster */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="poster">Match Poster (Optional)</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="w-full justify-start" type="button">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleAddMatch}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Match
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Added Matches */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-900">Today's Added Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sport</TableHead>
                  <TableHead>Teams</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Winner</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      No matches added yet. Add your first match above!
                    </TableCell>
                  </TableRow>
                ) : (
                  matches.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell>{match.sport}</TableCell>
                      <TableCell>
                        <div className="text-gray-900">{match.team1}</div>
                        <div className="text-gray-500">vs</div>
                        <div className="text-gray-900">{match.team2}</div>
                      </TableCell>
                      <TableCell>{match.time}</TableCell>
                      <TableCell>{match.location}</TableCell>
                      <TableCell>
                        {match.score1 && match.score2 ? `${match.score1} - ${match.score2}` : '-'}
                      </TableCell>
                      <TableCell>{match.winner || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMatch(match.id)}
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
