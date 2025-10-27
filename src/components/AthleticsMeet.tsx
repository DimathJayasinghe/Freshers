import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Trophy, Medal, Timer, Users, Eye, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

interface AthleticsEvent {
  id: string;
  name: string;
  category: 'men' | 'women';
  type: 'track' | 'field';
  unit: string;
  status: 'completed' | 'ongoing' | 'upcoming';
  results?: {
    position: number;
    faculty: string;
    athlete: string;
    performance: string;
    points: number;
  }[];
}

const athleticsEvents: AthleticsEvent[] = [
  {
    id: '100m-men',
    name: '100m Sprint',
    category: 'men',
    type: 'track',
    unit: 'seconds',
    status: 'completed',
    results: [
      { position: 1, faculty: 'Faculty of Engineering', athlete: 'Alex Johnson', performance: '10.85s', points: 10 },
      { position: 2, faculty: 'Faculty of Science', athlete: 'Mark Taylor', performance: '11.02s', points: 7 },
      { position: 3, faculty: 'Faculty of Arts', athlete: 'Chris Evans', performance: '11.24s', points: 5 },
      { position: 4, faculty: 'Faculty of Medicine', athlete: 'Ryan Cooper', performance: '11.45s', points: 3 }
    ]
  },
  {
    id: '100m-women',
    name: '100m Sprint',
    category: 'women',
    type: 'track',
    unit: 'seconds',
    status: 'completed',
    results: [
      { position: 1, faculty: 'Faculty of Science', athlete: 'Emma Williams', performance: '12.34s', points: 10 },
      { position: 2, faculty: 'Faculty of Engineering', athlete: 'Sofia Martinez', performance: '12.67s', points: 7 },
      { position: 3, faculty: 'Faculty of Management', athlete: 'Olivia Brown', performance: '12.89s', points: 5 },
      { position: 4, faculty: 'Faculty of Arts', athlete: 'Ava Davis', performance: '13.12s', points: 3 }
    ]
  },
  {
    id: '400m-men',
    name: '400m Race',
    category: 'men',
    type: 'track',
    unit: 'seconds',
    status: 'ongoing'
  },
  {
    id: 'long-jump-men',
    name: 'Long Jump',
    category: 'men',
    type: 'field',
    unit: 'meters',
    status: 'completed',
    results: [
      { position: 1, faculty: 'Faculty of Arts', athlete: 'James Wilson', performance: '7.24m', points: 10 },
      { position: 2, faculty: 'Faculty of Engineering', athlete: 'Robert Lee', performance: '7.12m', points: 7 },
      { position: 3, faculty: 'Faculty of Science', athlete: 'Michael Chen', performance: '6.98m', points: 5 },
      { position: 4, faculty: 'Faculty of Medicine', athlete: 'Daniel Kim', performance: '6.85m', points: 3 }
    ]
  },
  {
    id: 'shot-put-women',
    name: 'Shot Put',
    category: 'women',
    type: 'field',
    unit: 'meters',
    status: 'upcoming'
  }
];

export function AthleticsMeet() {
  const [selectedEvent, setSelectedEvent] = useState<AthleticsEvent | null>(null);

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${position}`;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white">Completed</Badge>;
      case 'ongoing':
        return <Badge className="bg-orange-500 text-white animate-pulse">Live Now</Badge>;
      case 'upcoming':
        return <Badge className="bg-gray-500 text-white">Upcoming</Badge>;
      default:
        return null;
    }
  };

  const EventCard = ({ event }: { event: AthleticsEvent }) => (
    <div
      className="glass-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
      onClick={() => setSelectedEvent(event)}
    >
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-white" />
            <p className="text-white">{event.name}</p>
          </div>
          {getStatusBadge(event.status)}
        </div>
        <p className="text-orange-100 text-sm">{event.category === 'men' ? "Men's" : "Women's"} Category</p>
      </div>

      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-600 text-sm mb-1">Type</p>
            <p className="text-gray-900 capitalize">{event.type} Event</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm mb-1">Unit</p>
            <p className="text-gray-900">{event.unit}</p>
          </div>
        </div>

        {event.results && event.results.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-600">Winner:</span>
              </div>
              <p className="text-sm text-gray-900 truncate max-w-[150px]">
                {event.results[0].faculty}
              </p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-600">Performance:</span>
              <p className="text-sm text-gray-900 font-mono">{event.results[0].performance}</p>
            </div>
          </div>
        )}

        <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white">
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 mb-6 shadow-xl">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-gray-900 mb-4 bg-gradient-to-r from-orange-700 via-red-600 to-red-700 bg-clip-text text-transparent">
          Athletics Championship
        </h1>
        <p className="text-gray-700 max-w-3xl mx-auto text-lg">
          Track and field events contributing to the overall faculty scoreboard
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12 animate-fade-in">
        <div className="glass-card rounded-2xl p-6 text-center border border-white/30 shadow-lg">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <p className="text-gray-900 mb-1">16</p>
          <p className="text-gray-600 text-sm">Total Events</p>
        </div>

        <div className="glass-card rounded-2xl p-6 text-center border border-white/30 shadow-lg">
          <div className="bg-gradient-to-br from-green-500 to-green-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <p className="text-gray-900 mb-1">10</p>
          <p className="text-gray-600 text-sm">Completed</p>
        </div>

        <div className="glass-card rounded-2xl p-6 text-center border border-white/30 shadow-lg">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Medal className="w-7 h-7 text-white" />
          </div>
          <p className="text-gray-900 mb-1">40</p>
          <p className="text-gray-600 text-sm">Medals Awarded</p>
        </div>

        <div className="glass-card rounded-2xl p-6 text-center border border-white/30 shadow-lg">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Users className="w-7 h-7 text-white" />
          </div>
          <p className="text-gray-900 mb-1">120</p>
          <p className="text-gray-600 text-sm">Athletes</p>
        </div>
      </div>

      {/* Events Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="glass-effect shadow-xl rounded-2xl p-2 border border-white/20">
            <TabsTrigger value="all" className="px-6 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-orange-700 data-[state=active]:text-white rounded-xl transition-all duration-300">
              All Events
            </TabsTrigger>
            <TabsTrigger value="track" className="px-6 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-orange-700 data-[state=active]:text-white rounded-xl transition-all duration-300">
              Track
            </TabsTrigger>
            <TabsTrigger value="field" className="px-6 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-orange-700 data-[state=active]:text-white rounded-xl transition-all duration-300">
              Field
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {athleticsEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="track" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {athleticsEvents.filter(e => e.type === 'track').map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="field" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {athleticsEvents.filter(e => e.type === 'field').map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Event Details Modal */}
      {selectedEvent && selectedEvent.results && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setSelectedEvent(null)}>
          <div className="glass-card rounded-2xl max-w-3xl w-full border border-white/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white mb-2">{selectedEvent.name}</h2>
                  <p className="text-orange-100">{selectedEvent.category === 'men' ? "Men's" : "Women's"} • {selectedEvent.type === 'track' ? 'Track' : 'Field'} Event</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedEvent(null)}
                  className="text-white hover:bg-white/10"
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Athlete</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedEvent.results?.map((result) => (
                    <TableRow key={result.position} className={result.position <= 3 ? 'bg-yellow-50/50' : ''}>
                      <TableCell>
                        <div className="text-center text-xl">{getMedalIcon(result.position)}</div>
                      </TableCell>
                      <TableCell className="font-medium">{result.faculty}</TableCell>
                      <TableCell>{result.athlete}</TableCell>
                      <TableCell className="font-mono">{result.performance}</TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-blue-500 text-white">{result.points} pts</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
