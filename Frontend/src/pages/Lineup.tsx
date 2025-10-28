import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";
import { scheduleData } from "@/data/lineupData";

export function Lineup() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Freshers' Championship - 2025
        </h1>
        <p className="text-lg text-red-400 font-semibold">- SCHEDULE -</p>
      </div>

      <div className="space-y-6">
        {scheduleData.map((day, index) => (
          <Card
            key={index}
            className="bg-black/40 backdrop-blur-xl border border-white/10 hover:border-red-500/50 transition-all duration-300 shadow-xl"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-lg md:text-xl">
                <Calendar className="h-5 w-5 text-yellow-500" />
                {day.date}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {day.events.map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-red-500/50 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-full bg-red-600 rounded"></div>
                      <div>
                        <p className="text-white font-semibold text-sm md:text-base">
                          {event.sport}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm md:text-base">
                      <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm md:text-base">
                      <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span>{event.venue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
