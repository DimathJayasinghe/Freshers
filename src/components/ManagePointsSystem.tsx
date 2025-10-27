"use client";
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Award, Save, RotateCcw, Trophy, Medal, Target, Users, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface PointsConfig {
  firstPlace: number;
  secondPlace: number;
  thirdPlace: number;
  fourthPlace: number;
  participation: number;
}

interface EventPointsConfig extends PointsConfig {
  category: string;
  eventType: string;
}

interface ManagePointsSystemProps {
  onBack: () => void;
}

export function ManagePointsSystem({ onBack }: ManagePointsSystemProps) {
  // Team Sports Points
  const [teamSportsPoints, setTeamSportsPoints] = useState<PointsConfig>({
    firstPlace: 25,
    secondPlace: 18,
    thirdPlace: 12,
    fourthPlace: 8,
    participation: 2
  });

  // Swimming Events Points
  const [swimmingPoints, setSwimmingPoints] = useState<PointsConfig>({
    firstPlace: 10,
    secondPlace: 7,
    thirdPlace: 5,
    fourthPlace: 3,
    participation: 1
  });

  // Athletics Events Points
  const [athleticsPoints, setAthleticsPoints] = useState<PointsConfig>({
    firstPlace: 10,
    secondPlace: 7,
    thirdPlace: 5,
    fourthPlace: 3,
    participation: 1
  });

  // Individual Sports Points
  const [individualPoints, setIndividualPoints] = useState<PointsConfig>({
    firstPlace: 15,
    secondPlace: 10,
    thirdPlace: 7,
    fourthPlace: 4,
    participation: 1
  });

  const handleSave = () => {
    // Save logic here
    toast.success('Points system updated successfully!');
  };

  const handleReset = () => {
    setTeamSportsPoints({
      firstPlace: 25,
      secondPlace: 18,
      thirdPlace: 12,
      fourthPlace: 8,
      participation: 2
    });
    setSwimmingPoints({
      firstPlace: 10,
      secondPlace: 7,
      thirdPlace: 5,
      fourthPlace: 3,
      participation: 1
    });
    setAthleticsPoints({
      firstPlace: 10,
      secondPlace: 7,
      thirdPlace: 5,
      fourthPlace: 3,
      participation: 1
    });
    setIndividualPoints({
      firstPlace: 15,
      secondPlace: 10,
      thirdPlace: 7,
      fourthPlace: 4,
      participation: 1
    });
    toast.info('Points reset to default values');
  };

  const PointsEditor = ({ 
    title, 
    icon, 
    points, 
    onChange, 
    color 
  }: { 
    title: string; 
    icon: ReactNode; 
    points: PointsConfig; 
    onChange: (points: PointsConfig) => void;
    color: string;
  }) => (
    <div className="glass-card rounded-2xl border border-white/30 shadow-lg">
      <CardHeader className={`bg-gradient-to-r ${color} text-white rounded-t-2xl`}>
        <CardTitle className="text-white flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* First Place */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-40">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-md">
                <span className="text-lg">🥇</span>
              </div>
              <Label className="text-gray-900">1st Place</Label>
            </div>
            <Input
              type="number"
              value={points.firstPlace}
              onChange={(e) => onChange({ ...points, firstPlace: Number(e.target.value) })}
              className="flex-1 border-2"
            />
            <span className="text-gray-600 text-sm w-16">points</span>
          </div>

          {/* Second Place */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-40">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-md">
                <span className="text-lg">🥈</span>
              </div>
              <Label className="text-gray-900">2nd Place</Label>
            </div>
            <Input
              type="number"
              value={points.secondPlace}
              onChange={(e) => onChange({ ...points, secondPlace: Number(e.target.value) })}
              className="flex-1 border-2"
            />
            <span className="text-gray-600 text-sm w-16">points</span>
          </div>

          {/* Third Place */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-40">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-md">
                <span className="text-lg">🥉</span>
              </div>
              <Label className="text-gray-900">3rd Place</Label>
            </div>
            <Input
              type="number"
              value={points.thirdPlace}
              onChange={(e) => onChange({ ...points, thirdPlace: Number(e.target.value) })}
              className="flex-1 border-2"
            />
            <span className="text-gray-600 text-sm w-16">points</span>
          </div>

          {/* Fourth Place */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-40">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
                <span className="text-gray-700 text-sm">#4</span>
              </div>
              <Label className="text-gray-900">4th Place</Label>
            </div>
            <Input
              type="number"
              value={points.fourthPlace}
              onChange={(e) => onChange({ ...points, fourthPlace: Number(e.target.value) })}
              className="flex-1 border-2"
            />
            <span className="text-gray-600 text-sm w-16">points</span>
          </div>

          {/* Participation */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 w-40">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-md">
                <Users className="w-5 h-5 text-green-700" />
              </div>
              <Label className="text-gray-900">Participation</Label>
            </div>
            <Input
              type="number"
              value={points.participation}
              onChange={(e) => onChange({ ...points, participation: Number(e.target.value) })}
              className="flex-1 border-2"
            />
            <span className="text-gray-600 text-sm w-16">points</span>
          </div>
        </div>
      </CardContent>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Button>
          <h2 className="text-gray-900 mb-2">Points System Management</h2>
          <p className="text-gray-600">Configure points awarded for different positions and participation</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-2 border-gray-300"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <div className="glass-card rounded-2xl p-6 mb-8 border border-blue-200 bg-blue-50/50">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Award className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-gray-900 mb-2">Points System Configuration</h3>
            <p className="text-gray-600 text-sm">
              Set the points awarded for each position (1st, 2nd, 3rd, 4th) and participation in different event categories. 
              These points contribute to the overall faculty scoreboard. Higher values indicate more important events.
            </p>
          </div>
        </div>
      </div>

      {/* Points Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PointsEditor
          title="Team Sports"
          icon={<Trophy className="w-5 h-5" />}
          points={teamSportsPoints}
          onChange={setTeamSportsPoints}
          color="from-blue-600 to-blue-700"
        />

        <PointsEditor
          title="Swimming Events"
          icon={<span className="text-xl">🏊</span>}
          points={swimmingPoints}
          onChange={setSwimmingPoints}
          color="from-cyan-600 to-cyan-700"
        />

        <PointsEditor
          title="Athletics Events"
          icon={<span className="text-xl">🏃</span>}
          points={athleticsPoints}
          onChange={setAthleticsPoints}
          color="from-orange-600 to-orange-700"
        />

        <PointsEditor
          title="Individual Sports"
          icon={<Target className="w-5 h-5" />}
          points={individualPoints}
          onChange={setIndividualPoints}
          color="from-purple-600 to-purple-700"
        />
      </div>

      {/* Summary Table */}
      <div className="mt-8 glass-card rounded-2xl border border-white/30 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-t-2xl">
          <CardTitle className="text-white flex items-center gap-2">
            <Medal className="w-5 h-5" />
            Points Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Category</TableHead>
                <TableHead className="text-center">🥇 1st</TableHead>
                <TableHead className="text-center">🥈 2nd</TableHead>
                <TableHead className="text-center">🥉 3rd</TableHead>
                <TableHead className="text-center">4th</TableHead>
                <TableHead className="text-center">Participation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Team Sports</TableCell>
                <TableCell className="text-center">{teamSportsPoints.firstPlace}</TableCell>
                <TableCell className="text-center">{teamSportsPoints.secondPlace}</TableCell>
                <TableCell className="text-center">{teamSportsPoints.thirdPlace}</TableCell>
                <TableCell className="text-center">{teamSportsPoints.fourthPlace}</TableCell>
                <TableCell className="text-center">{teamSportsPoints.participation}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Swimming Events</TableCell>
                <TableCell className="text-center">{swimmingPoints.firstPlace}</TableCell>
                <TableCell className="text-center">{swimmingPoints.secondPlace}</TableCell>
                <TableCell className="text-center">{swimmingPoints.thirdPlace}</TableCell>
                <TableCell className="text-center">{swimmingPoints.fourthPlace}</TableCell>
                <TableCell className="text-center">{swimmingPoints.participation}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Athletics Events</TableCell>
                <TableCell className="text-center">{athleticsPoints.firstPlace}</TableCell>
                <TableCell className="text-center">{athleticsPoints.secondPlace}</TableCell>
                <TableCell className="text-center">{athleticsPoints.thirdPlace}</TableCell>
                <TableCell className="text-center">{athleticsPoints.fourthPlace}</TableCell>
                <TableCell className="text-center">{athleticsPoints.participation}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Individual Sports</TableCell>
                <TableCell className="text-center">{individualPoints.firstPlace}</TableCell>
                <TableCell className="text-center">{individualPoints.secondPlace}</TableCell>
                <TableCell className="text-center">{individualPoints.thirdPlace}</TableCell>
                <TableCell className="text-center">{individualPoints.fourthPlace}</TableCell>
                <TableCell className="text-center">{individualPoints.participation}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </div>
    </div>
  );
}
