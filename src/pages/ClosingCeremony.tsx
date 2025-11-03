import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Trophy, Award, Sparkles, Users, Music, Camera, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function ClosingCeremony() {
  const navigate = useNavigate();

  const ceremonyDetails = {
    date: "December 9, 2025",
    time: "6:00 PM - 9:00 PM",
    venue: "Main Auditorium",
    duration: "3 Hours"
  };

  const highlights = [
    {
      icon: Trophy,
      title: "Award Ceremony",
      description: "Recognition of champions and outstanding performers",
      color: "text-yellow-500"
    },
    {
      icon: Users,
      title: "Guest Speeches",
      description: "Inspiring words from university officials and honored guests",
      color: "text-blue-500"
    },
    {
      icon: Music,
      title: "Cultural Performances",
      description: "Spectacular performances by talented students",
      color: "text-purple-500"
    },
    {
      icon: Camera,
      title: "Photo Opportunities",
      description: "Capture memories with teams and trophies",
      color: "text-pink-500"
    }
  ];

  const awards = [
    "Overall Championship Trophy",
    "Men's Championship",
    "Women's Championship",
    "Best Sportsman",
    "Best Sportswoman",
    "Fair Play Award",
    "Most Improved Faculty"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-950 via-black to-red-950 py-16 md:py-24 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-600/20 border border-yellow-500/50 rounded-full px-4 py-2 mb-6 backdrop-blur-sm animate-fade-in">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-400 text-sm font-semibold">Grand Finale</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up">
            Closing <span className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">Ceremony</span>
          </h1>

          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto mb-8 animate-fade-in-up delay-200">
            Join us for the grand finale as we celebrate the achievements, honor the champions, 
            and conclude UOC Freshers' Meet 2025 with a spectacular closing ceremony.
          </p>

          <div className="flex items-center justify-center gap-2 text-yellow-400 text-2xl md:text-3xl font-bold mb-8 animate-fade-in-up delay-300">
            <PartyPopper className="w-8 h-8" />
            <span>A Night to Remember</span>
            <PartyPopper className="w-8 h-8" />
          </div>

          {/* Key Details Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto animate-fade-in-up delay-400">
            <Card className="bg-gradient-to-br from-red-900/40 to-black/40 border-red-500/30 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-1">Date</h3>
                <p className="text-gray-300 text-sm">{ceremonyDetails.date}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-900/40 to-black/40 border-yellow-500/30 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-1">Time</h3>
                <p className="text-gray-300 text-sm">{ceremonyDetails.time}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/40 to-black/40 border-blue-500/30 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <MapPin className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-1">Venue</h3>
                <p className="text-gray-300 text-sm">{ceremonyDetails.venue}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        {/* Event Highlights */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Event <span className="text-yellow-500">Highlights</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Experience an unforgettable evening filled with celebration, recognition, and entertainment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {highlights.map((highlight, index) => (
              <Card
                key={index}
                className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-white/10 hover:border-red-500/50 transition-all duration-300 group animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <highlight.icon className={`w-6 h-6 ${highlight.color}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg mb-2 group-hover:text-yellow-400 transition-colors">
                        {highlight.title}
                      </CardTitle>
                      <p className="text-gray-400 text-sm">{highlight.description}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Awards Section */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              <Trophy className="w-8 h-8 inline mb-2 text-yellow-500" /> Awards & Recognition
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Honoring excellence, sportsmanship, and outstanding achievements
            </p>
          </div>

          <Card className="bg-gradient-to-br from-yellow-900/20 via-black to-red-900/20 border-yellow-500/30">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {awards.map((award, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-lg p-4 hover:border-yellow-500/50 hover:bg-white/5 transition-all animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Award className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    <span className="text-white font-medium text-sm">{award}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Important Information */}
        <Card className="bg-gradient-to-r from-red-950/50 via-black to-red-950/50 border-red-500/30 mb-12">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              Important Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
              <div>
                <h4 className="text-white font-semibold mb-2">Dress Code</h4>
                <p className="text-sm">Formal or semi-formal attire recommended</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Attendance</h4>
                <p className="text-sm">Open to all students, faculty, and staff</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Entry</h4>
                <p className="text-sm">Doors open at 5:30 PM</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Photography</h4>
                <p className="text-sm">Professional photographers will be present</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-yellow-950/50 via-black to-yellow-950/50 border-yellow-500/30">
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Don't Miss This Memorable Event!
            </h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Join us in celebrating the spirit of sportsmanship, teamwork, and excellence. 
              Be part of the grand finale that marks the end of an incredible tournament.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                onClick={() => navigate('/lineup')}
                className=" bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              >
                View Full Schedule
              </Button>
              <Button
                onClick={() => navigate('/leaderboard')}
                variant="outline"
                className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
              >
                View Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
