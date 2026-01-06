import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Trophy, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function ClosingCeremony() {
  const navigate = useNavigate();

  const ceremonyDetails = {
    date: "January 12, 2026",
    time: "3:00 PM ",
    venue: "NAT",
    duration: "3 Hours"
  };

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
        {/* Sections removed: Event Highlights, Awards & Recognition, Important Information */}

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
