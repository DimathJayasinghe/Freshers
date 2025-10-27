import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Settings, ChevronRight, Trophy, Calendar, Users, Award, Image as ImageIcon } from 'lucide-react';
import { SportType } from './ManageSportsTypes';
import { Faculty } from './ManageFaculties';
import { Badge } from './ui/badge';

interface AdminDashboardProps {
  sports: SportType[];
  faculties: Faculty[];
  onManageSport: (sportName: string) => void;
  onManageSportsTypes: () => void;
  onManageFaculties: () => void;
  onManageLineup: () => void;
  onManagePoints?: () => void;
  onManageMedia?: () => void;
}

export function AdminDashboard({ sports, faculties, onManageSport, onManageSportsTypes, onManageFaculties, onManageLineup, onManagePoints, onManageMedia }: AdminDashboardProps) {
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

  const getSportKey = (sport: SportType) => `${sport.name} - ${getCategoryLabel(sport.category)}`;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-white mb-2">Admin Dashboard</h2>
        <p className="text-gray-600">Manage sports and tournament settings</p>
      </div>

      {/* Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-lg border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Settings className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 mb-1">Manage Sports</h3>
                  <p className="text-gray-600">Configure sport types</p>
                </div>
              </div>
              <Button
                onClick={onManageSportsTypes}
                className="bg-green-500 hover:bg-green-600"
              >
                Configure
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 mb-1">Manage Faculties</h3>
                  <p className="text-gray-600">Configure participating teams</p>
                </div>
              </div>
              <Button
                onClick={onManageFaculties}
                className="bg-purple-500 hover:bg-purple-600"
              >
                Configure
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 mb-1">Manage Lineup</h3>
                  <p className="text-gray-600">Schedule daily matches</p>
                </div>
              </div>
              <Button
                onClick={onManageLineup}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Configure
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 mb-1">Points System</h3>
                  <p className="text-gray-600">Configure scoring rules</p>
                </div>
              </div>
              <Button
                onClick={onManagePoints}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Configure
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-l-cyan-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 mb-1">Media Management</h3>
                  <p className="text-gray-600">Upload banners & covers</p>
                </div>
              </div>
              <Button
                onClick={onManageMedia}
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                Manage
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sports Management */}
      <div className="mb-6">
        <h3 className="text-gray-900 mb-2 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-blue-900" />
          Manage Individual Sports
        </h3>
        <p className="text-gray-600 text-sm">Set up tournament draws and update match results for each sport</p>
      </div>

      {sports.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="p-8 text-center text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="mb-4">No sports configured yet</p>
            <Button onClick={onManageSportsTypes} className="bg-blue-900 hover:bg-blue-800">
              Add Your First Sport
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sports.map((sport) => (
            <Card key={sport.id} className="shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-br from-blue-50 to-blue-100">
                <CardTitle className="text-blue-900 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    {sport.name}
                  </div>
                  <Badge className={getCategoryBadgeColor(sport.category)}>
                    {getCategoryLabel(sport.category)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Teams:</span>
                    <span className="text-gray-900">{sport.maxTeams}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Scoring:</span>
                    <span className="text-gray-900 capitalize">{sport.scoringType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Venue:</span>
                    <span className="text-gray-900 truncate ml-2">{sport.venue}</span>
                  </div>
                </div>
                <Button
                  onClick={() => onManageSport(getSportKey(sport))}
                  className="w-full bg-blue-900 hover:bg-blue-800"
                >
                  Manage {sport.name}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 text-blue-900 mx-auto mb-2" />
            <p className="text-blue-900 mb-1">{sports.length}</p>
            <p className="text-gray-600">Active Sports</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-green-600 mb-1">12</p>
            <p className="text-gray-600">Matches Today</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-purple-600 mb-1">{faculties.length}</p>
            <p className="text-gray-600">Faculties</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}