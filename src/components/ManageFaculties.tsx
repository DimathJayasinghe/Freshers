"use client";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { PlusCircle, Trash2, Edit2, Users } from 'lucide-react';
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

export interface Faculty {
  id: number;
  name: string;
  shortName: string;
  color: string;
  coverPhoto?: string;
}

interface ManageFacultiesProps {
  faculties: Faculty[];
  onFacultiesChange: (faculties: Faculty[]) => void;
}

const colorOptions = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#ef4444', // red
  '#06b6d4', // cyan
  '#f97316', // orange
];

export function ManageFaculties({ faculties, onFacultiesChange }: ManageFacultiesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    color: colorOptions[0]
  });

  const handleInputChange = (field: 'name' | 'shortName' | 'color', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddFaculty = () => {
    if (!formData.name || !formData.shortName) {
      toast('Please fill in all required fields');
      return;
    }

    if (editingFaculty) {
      // Update existing faculty
      onFacultiesChange(
        faculties.map(faculty =>
          faculty.id === editingFaculty.id
            ? { ...editingFaculty, ...formData }
            : faculty
        )
      );
      toast('Faculty updated successfully!');
    } else {
      // Add new faculty
      const newFaculty: Faculty = {
        id: faculties.length + 1,
        ...formData
      };
      onFacultiesChange([...faculties, newFaculty]);
      toast('Faculty added successfully!');
    }

    setFormData({ name: '', shortName: '', color: colorOptions[0] });
    setEditingFaculty(null);
    setIsDialogOpen(false);
  };

  const handleEditFaculty = (faculty: Faculty) => {
    setEditingFaculty(faculty);
    setFormData({
      name: faculty.name,
      shortName: faculty.shortName,
      color: faculty.color
    });
    setIsDialogOpen(true);
  };

  const handleDeleteFaculty = (id: number) => {
    onFacultiesChange(faculties.filter(faculty => faculty.id !== id));
    toast('Faculty deleted');
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingFaculty(null);
    setFormData({ name: '', shortName: '', color: colorOptions[0] });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-white mb-2">Manage Faculties</h2>
        <p className="text-gray-600">Add, edit, or remove participating faculties</p>
      </div>

      <Card className="shadow-lg mb-6">
        <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Participating Faculties
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={() => handleDialogClose()}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Faculty
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}</DialogTitle>
                  <DialogDescription>
                    Enter the details for the faculty
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Faculty Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Faculty of Engineering"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shortName">Short Name *</Label>
                    <Input
                      id="shortName"
                      placeholder="e.g., Engineering"
                      value={formData.shortName}
                      onChange={(e) => handleInputChange('shortName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Faculty Color</Label>
                    <div className="flex gap-2 flex-wrap">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleInputChange('color', color)}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            formData.color === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddFaculty} className="bg-blue-900 hover:bg-blue-800">
                    {editingFaculty ? 'Update' : 'Add'} Faculty
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
                  <TableHead>Faculty Name</TableHead>
                  <TableHead>Short Name</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faculties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                      No faculties added yet. Add your first faculty above!
                    </TableCell>
                  </TableRow>
                ) : (
                  faculties.map((faculty) => (
                    <TableRow key={faculty.id}>
                      <TableCell>{faculty.name}</TableCell>
                      <TableCell>{faculty.shortName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: faculty.color }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditFaculty(faculty)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFaculty(faculty.id)}
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