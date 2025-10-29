// Tournament Draw Data

export interface Match {
  match1: {
    team: string;
    score: string;
    winner: boolean;
  };
  match2: {
    team: string;
    score: string;
    winner: boolean;
  };
}

export interface TournamentDraw {
  quarterFinals: Match[];
  semiFinals: Match[];
  final: {
    match1: {
      team: string;
      score: string;
      winner: boolean;
    };
    match2: {
      team: string;
      score: string;
      winner: boolean;
    };
  };
  date?: string;
  venue?: string;
}

// Sample tournament data - this would be loaded from backend in production
export const getTournamentDraw = (sportName: string): TournamentDraw => {
  // For now, return mock data
  // In production, this would fetch from an API based on sportName
  console.log(`Loading tournament draw for: ${sportName}`);
  
  // Map sport names to dates and venues based on schedule
  const sportSchedule: Record<string, { date: string; venue: string }> = {
    "cricket": { date: "December 9, 2025", venue: "Cricket Ground" },
    "football": { date: "December 9, 2025", venue: "Main Field" },
    "basketball": { date: "December 5, 2025", venue: "Indoor Stadium" },
    "volleyball": { date: "December 5, 2025", venue: "Volleyball Court" },
    "athletics": { date: "December 4, 2025", venue: "University Ground" },
    "swimming": { date: "December 4, 2025", venue: "University Pool" },
    "tennis": { date: "December 3, 2025", venue: "Tennis Courts" },
    "badminton": { date: "December 3, 2025", venue: "Indoor Stadium Hall 2" },
    "table-tennis": { date: "November 24, 2025", venue: "Sports Complex" },
    "chess": { date: "November 25, 2025", venue: "Student Center Hall" },
  };

  const schedule = sportSchedule[sportName.toLowerCase()] || { date: "TBD", venue: "TBD" };
  
  return {
    quarterFinals: [
      {
        match1: { team: "Faculty of Science", score: "195", winner: true },
        match2: { team: "Faculty of Management & Finance", score: "142", winner: false },
      },
      {
        match1: { team: "Faculty of Medicine", score: "188", winner: true },
        match2: { team: "Faculty of Technology", score: "175", winner: false },
      },
      {
        match1: { team: "Faculty of Arts", score: "202", winner: true },
        match2: { team: "Faculty of Law", score: "168", winner: false },
      },
      {
        match1: { team: "University of Colombo School of Computing", score: "165", winner: true },
        match2: { team: "Faculty of Education", score: "158", winner: false },
      },
    ],
    semiFinals: [
      {
        match1: { team: "Faculty of Science", score: "210", winner: true },
        match2: { team: "Faculty of Medicine", score: "195", winner: false },
      },
      {
        match1: { team: "Faculty of Arts", score: "178", winner: true },
        match2: { team: "University of Colombo School of Computing", score: "156", winner: false },
      },
    ],
    final: {
      match1: { team: "Faculty of Science", score: "185", winner: true },
      match2: { team: "Faculty of Arts", score: "162", winner: false },
    },
    date: schedule.date,
    venue: schedule.venue,
  };
};

// Faculty short names mapping
export const facultyShortNames: Record<string, string> = {
  "Faculty of Arts": "FOA",
  "Faculty of Education": "FOE",
  "Faculty of Indigenous Medicine": "FIM",
  "Faculty of Law": "FOL",
  "Faculty of Management & Finance": "FMF",
  "Faculty of Medicine": "FOM",
  "Faculty of Nursing": "FON",
  "Faculty of Science": "FOS",
  "Faculty of Technology": "FOT",
  "Sri Palee Campus": "SPC",
  "University of Colombo School of Computing": "UCSC",
};

// Helper function to get short name
export const getShortFacultyName = (fullName: string): string => {
  return facultyShortNames[fullName] || fullName;
};
