export interface LiveMatch {
  id: number;
  sport: string;
  venue: string;
  team1: string;
  team2: string;
  status: string;
  statusColor: string;
}

export interface ScheduleMatch {
  id: number;
  time: string;
  sport: string;
  match: string;
  team1: string;
  team2: string;
  venue: string;
}

export interface TournamentStats {
  totalSports: number;
  totalFaculties: number;
  liveMatches: number;
  todayMatches: number;
}

export const tournamentStats: TournamentStats = {
  totalSports: 17,
  totalFaculties: 20,
  liveMatches: 2,
  todayMatches: 3
};

export const liveMatches: LiveMatch[] = [
  {
    id: 1,
    sport: "Cricket",
    venue: "University Ground",
    team1: "Faculty of Arts",
    team2: "Faculty of Science",
    status: "Live - 2nd Innings",
    statusColor: "text-green-400"
  },
  {
    id: 2,
    sport: "Basketball",
    venue: "Indoor Stadium",
    team1: "UCSC",
    team2: "Faculty of Medicine",
    status: "Live - 3rd Quarter",
    statusColor: "text-yellow-400"
  }
];

export const todaySchedule: ScheduleMatch[] = [
  {
    id: 1,
    time: "4:30 PM",
    sport: "Football",
    match: "Semi Final",
    team1: "Faculty of Law",
    team2: "Faculty of Management",
    venue: "Main Field"
  },
  {
    id: 2,
    time: "5:00 PM",
    sport: "Volleyball",
    match: "Quarter Final",
    team1: "Faculty of Education",
    team2: "Faculty of Technology",
    venue: "Volleyball Court A"
  },
  {
    id: 3,
    time: "6:00 PM",
    sport: "Badminton",
    match: "Round of 16",
    team1: "Faculty of Nursing",
    team2: "Sri Palee Campus",
    venue: "Indoor Stadium Hall 2"
  }
];
