import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export function Results() {
  const completedEvents = [
    {
      id: 1,
      event: "100m Sprint - Men's",
      winner: "John Smith",
      time: "10.85s",
      date: "Oct 27, 2025",
    },
    {
      id: 2,
      event: "Long Jump - Women's",
      winner: "Sarah Johnson",
      time: "6.45m",
      date: "Oct 27, 2025",
    },
    {
      id: 3,
      event: "Shot Put - Men's",
      winner: "Mike Davis",
      time: "18.92m",
      date: "Oct 26, 2025",
    },
    {
      id: 4,
      event: "200m Sprint - Women's",
      winner: "Emily Brown",
      time: "23.47s",
      date: "Oct 26, 2025",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h1 className="text-4xl font-bold text-white mb-2">Results</h1>
      <p className="text-gray-400 mb-4">Completed events and winners</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {completedEvents.map((result) => (
          <Card
            key={result.id}
            className="bg-gradient-to-br from-gray-900 to-black border-red-800"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white">{result.event}</CardTitle>
                  <CardDescription className="text-gray-400 mt-1">
                    {result.date}
                  </CardDescription>
                </div>
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Winner:</span>
                  <span className="text-white font-semibold">{result.winner}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Result:</span>
                  <span className="text-red-500 font-bold text-xl">{result.time}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
