import { ArrowLeft, Trophy, Medal, Award, Users, TrendingUp, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { FacultyScore } from "./FacultyPageNew";

interface FacultyDetailsPageProps {
  faculty: FacultyScore;
  onBack: () => void;
}

export function FacultyDetailsPage({ faculty, onBack }: FacultyDetailsPageProps) {
  const totalMedals = faculty.gold + faculty.silver + faculty.bronze;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={onBack}
        className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to All Faculties
      </Button>

      {/* Hero Section with Cover Photo */}
      <div className="relative overflow-hidden rounded-3xl h-64 md:h-80">
        <div
          className="absolute inset-0"
          style={{
            background: faculty.coverPhoto
              ? `url(${faculty.coverPhoto})`
              : `linear-gradient(135deg, ${faculty.color}99 0%, ${faculty.color}66 100%)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
        
        <div className="relative h-full flex flex-col justify-end p-8">
          <div className="flex items-end justify-between">
            <div>
              <Badge className="mb-3 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                Rank #{faculty.rank}
              </Badge>
              <h1 className="text-white mb-2">{faculty.name}</h1>
              <p className="text-slate-300">{faculty.shortName}</p>
            </div>
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white/20"
              style={{ backgroundColor: faculty.color }}
            >
              <div className="text-center">
                <Trophy className="w-8 h-8 mx-auto mb-1" />
                <p className="text-xs">CHAMPION</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-emerald-500/20 bg-gradient-to-br from-slate-900/90 to-emerald-900/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Trophy className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-1">Total Points</p>
              <p className="text-white">{faculty.totalPoints}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-yellow-500/20 bg-gradient-to-br from-slate-900/90 to-yellow-900/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Medal className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-1">Gold Medals</p>
              <p className="text-white">{faculty.gold}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-slate-500/20 bg-gradient-to-br from-slate-900/90 to-slate-700/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Medal className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-1">Silver Medals</p>
              <p className="text-white">{faculty.silver}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-orange-500/20 bg-gradient-to-br from-slate-900/90 to-orange-900/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Medal className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-1">Bronze Medals</p>
              <p className="text-white">{faculty.bronze}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medal Distribution */}
        <Card className="glass-card border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              Medal Distribution
            </CardTitle>
            <CardDescription className="text-slate-400">
              Total of {totalMedals} medals won across all events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Gold Medals</span>
                <span className="text-sm text-yellow-400">{faculty.gold} ({((faculty.gold / totalMedals) * 100).toFixed(1)}%)</span>
              </div>
              <Progress value={(faculty.gold / totalMedals) * 100} className="h-3 bg-slate-800" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Silver Medals</span>
                <span className="text-sm text-slate-300">{faculty.silver} ({((faculty.silver / totalMedals) * 100).toFixed(1)}%)</span>
              </div>
              <Progress value={(faculty.silver / totalMedals) * 100} className="h-3 bg-slate-800" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Bronze Medals</span>
                <span className="text-sm text-orange-400">{faculty.bronze} ({((faculty.bronze / totalMedals) * 100).toFixed(1)}%)</span>
              </div>
              <Progress value={(faculty.bronze / totalMedals) * 100} className="h-3 bg-slate-800" />
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="glass-card border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Performance Highlights
            </CardTitle>
            <CardDescription className="text-slate-400">
              Key achievements and statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-emerald-900/20 rounded-lg border border-emerald-500/20">
              <span className="text-slate-300">Highest Points</span>
              <span className="text-emerald-400">{Math.max(...faculty.sports.map(s => s.points))} pts</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
              <span className="text-slate-300">Sports Participated</span>
              <span className="text-blue-400">{faculty.sports.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
              <span className="text-slate-300">Average Points/Sport</span>
              <span className="text-yellow-400">
                {(faculty.totalPoints / faculty.sports.length).toFixed(1)} pts
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sports Performance Table */}
      <Card className="glass-card border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Sport-wise Performance
          </CardTitle>
          <CardDescription className="text-slate-400">
            Detailed breakdown of performance across all sports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-400">Sport</TableHead>
                <TableHead className="text-slate-400 text-center">Points</TableHead>
                <TableHead className="text-slate-400 text-center">
                  <Medal className="w-4 h-4 inline mr-1 text-yellow-500" />
                  Gold
                </TableHead>
                <TableHead className="text-slate-400 text-center">
                  <Medal className="w-4 h-4 inline mr-1 text-slate-400" />
                  Silver
                </TableHead>
                <TableHead className="text-slate-400 text-center">
                  <Medal className="w-4 h-4 inline mr-1 text-orange-500" />
                  Bronze
                </TableHead>
                <TableHead className="text-slate-400">Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faculty.sports.map((sport, index) => (
                <TableRow key={index} className="border-slate-700 hover:bg-slate-800/50">
                  <TableCell className="text-white">{sport.name}</TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      {sport.points}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      {sport.medals.gold}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30">
                      {sport.medals.silver}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                      {sport.medals.bronze}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Progress value={(sport.points / 100) * 100} className="h-2 bg-slate-800" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Achievements Section */}
      <Card className="glass-card border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Notable Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 rounded-xl border border-yellow-500/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h4 className="text-white mb-1">Top Performer</h4>
                  <p className="text-sm text-slate-400">
                    Highest points in {faculty.sports[0]?.name || "Multiple Sports"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 rounded-xl border border-emerald-500/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-white mb-1">Consistent Performance</h4>
                  <p className="text-sm text-slate-400">
                    Medals in {faculty.sports.length} different sports
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
