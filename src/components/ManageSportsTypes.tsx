"use client";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { PlusCircle, Trash2, Edit2, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Badge } from './ui/badge';

export interface SportType {
  id: number;
  name: string;
  category: 'men' | 'women' | 'mixed';
  maxTeams: number;
  scoringType: 'points' | 'sets' | 'time';
  venue: string;
}

interface ManageSportsTypesProps {
  sports: SportType[];
  onSportsChange: (sports: SportType[]) => void;
}

type SportFormData = {
  name: string;
  category: 'men' | 'women' | 'mixed';
  maxTeams: number;
  scoringType: 'points' | 'sets' | 'time';
  venue: string;
};

export function ManageSportsTypes({ sports, onSportsChange }: ManageSportsTypesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<SportType | null>(null);
  const [formData, setFormData] = useState<SportFormData>({
    name: '',
    category: 'men' as 'men' | 'women' | 'mixed',
    maxTeams: 8,
    scoringType: 'points' as 'points' | 'sets' | 'time',
    venue: ''
  });

  const handleInputChange = <K extends keyof SportFormData>(field: K, value: SportFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSport = () => {
    if (!formData.name || !formData.venue) {
      toast('Please fill in all required fields');
      return;
    }

    if (editingSport) {
      // Update existing sport
      onSportsChange(
        sports.map(sport =>
          sport.id === editingSport.id
            ? { ...editingSport, ...formData }
            : sport
        )
      );
      toast('Sport updated successfully!');
    } else {
      // Add new sport
      const newSport: SportType = {
        id: sports.length + 1,
        ...formData
      };
      onSportsChange([...sports, newSport]);
      toast('Sport added successfully!');
    }

    setFormData({ name: '', category: 'men', maxTeams: 8, scoringType: 'points', venue: '' });
    setEditingSport(null);
    setIsDialogOpen(false);
  };

  const handleEditSport = (sport: SportType) => {
    setEditingSport(sport);
    setFormData({
      name: sport.name,
      category: sport.category,
      maxTeams: sport.maxTeams,
      scoringType: sport.scoringType,
      venue: sport.venue
    });
    setIsDialogOpen(true);
  };

  const handleDeleteSport = (id: number) => {
    onSportsChange(sports.filter(sport => sport.id !== id));
    toast('Sport deleted');
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingSport(null);
    setFormData({ name: '', category: 'men', maxTeams: 8, scoringType: 'points', venue: '' });
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-white mb-2">Manage Sport Types</h2>
        <p className="text-gray-600">Add, edit, or remove sports from the tournament</p>
      </div>

      <Card className="shadow-lg mb-6">
        <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Sports in Tournament
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={() => handleDialogClose()}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Sport
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSport ? 'Edit Sport' : 'Add New Sport'}</DialogTitle>
                  <DialogDescription>
                    Enter the details for the sport
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Sport Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Cricket, Football"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value as SportFormData['category'])}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    >
                      <option value="men">Men's</option>
                      <option value="women">Women's</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxTeams">Maximum Teams</Label>
                    <Input
                      id="maxTeams"
                      type="number"
                      value={formData.maxTeams}
                      onChange={(e) => handleInputChange('maxTeams', parseInt(e.target.value) || 8)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scoringType">Scoring Type</Label>
                    <select
                      id="scoringType"
                      value={formData.scoringType}
                      onChange={(e) => handleInputChange('scoringType', e.target.value as SportFormData['scoringType'])}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    >
                      <option value="points">Points</option>
                      <option value="sets">Sets</option>
                      <option value="time">Time</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venue">Default Venue *</Label>
                    <Input
                      id="venue"
                      placeholder="e.g., Main Cricket Ground"
                      value={formData.venue}
                      onChange={(e) => handleInputChange('venue', e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSport} className="bg-blue-900 hover:bg-blue-800">
                    {editingSport ? 'Update' : 'Add'} Sport
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sport Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Max Teams</TableHead>
                  <TableHead>Scoring Type</TableHead>
                  <TableHead>Default Venue</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No sports added yet. Add your first sport above!
                    </TableCell>
                  </TableRow>
                ) : (
                  sports.map((sport) => (
                    <TableRow key={sport.id}>
                      <TableCell>{sport.name}</TableCell>
                      <TableCell>
                        <Badge className={getCategoryBadgeColor(sport.category)}>
                          {getCategoryLabel(sport.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>{sport.maxTeams}</TableCell>
                      <TableCell className="capitalize">{sport.scoringType}</TableCell>
                      <TableCell>{sport.venue}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSport(sport)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSport(sport.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
