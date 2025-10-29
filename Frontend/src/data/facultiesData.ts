// Faculty Data Types and Sample Data

export interface Faculty {
  id: string;
  name: string;
  shortName: string;
  colors: {
    primary: string;
    secondary: string;
  };
  logo: string;
  totalPoints: number;
  position: number;
  sportsParticipated: string[];
  achievements: Achievement[];
  teamMembers?: TeamMember[];
}

export interface Achievement {
  sport: string;
  position: string;
  year?: number;
}

export interface TeamMember {
  name: string;
  role: string;
  sport?: string;
}

// Sample Faculty Data
export const faculties: Faculty[] = [
  {
    id: "foa",
    name: "Faculty of Arts",
    shortName: "FOA",
    colors: {
      primary: "#DC2626", // Red
      secondary: "#FEE2E2",
    },
    logo: "/logos/faculties/arts.png",
    totalPoints: 450,
    position: 1,
    sportsParticipated: ["Cricket", "Football", "Basketball", "Volleyball", "Badminton"],
    achievements: [
      { sport: "Cricket", position: "Champions", year: 2024 },
      { sport: "Football", position: "Runner-up", year: 2024 },
    ],
    teamMembers: [
      { name: "Captain Name", role: "Captain", sport: "Cricket" },
      { name: "Vice Captain", role: "Vice Captain", sport: "Football" },
    ]
  },
  {
    id: "fom",
    name: "Faculty of Medicine",
    shortName: "FOM",
    colors: {
      primary: "#22C55E", // Green
      secondary: "#DCFCE7",
    },
    logo: "/logos/faculties/medicine.png",
    totalPoints: 420,
    position: 2,
    sportsParticipated: ["Basketball", "Volleyball", "Badminton", "Table Tennis"],
    achievements: [
      { sport: "Volleyball", position: "Champions", year: 2024 },
    ]
  },
  {
    id: "fos",
    name: "Faculty of Science",
    shortName: "FOS",
    colors: {
      primary: "#3B82F6", // Blue
      secondary: "#DBEAFE",
    },
    logo: "/logos/faculties/science.png",
    totalPoints: 380,
    position: 3,
    sportsParticipated: ["Cricket", "Basketball", "Tennis", "Badminton", "Athletics"],
    achievements: [
      { sport: "Basketball", position: "Champions", year: 2024 },
      { sport: "Cricket", position: "Semi-finalists", year: 2024 },
    ]
  },
  {
    id: "ucsc",
    name: "University of Colombo School of Computing",
    shortName: "UCSC",
    colors: {
      primary: "#A855F7", // Purple
      secondary: "#F3E8FF",
    },
    logo: "/logos/faculties/ucsc.png",
    totalPoints: 350,
    position: 4,
    sportsParticipated: ["Cricket", "Football", "Basketball", "Badminton", "Chess"],
    achievements: [
      { sport: "Chess", position: "Champions", year: 2024 },
      { sport: "Football", position: "Quarter-finalists", year: 2024 },
    ]
  },
  {
    id: "fmf",
    name: "Faculty of Management & Finance",
    shortName: "FMF",
    colors: {
      primary: "#F59E0B", // Amber
      secondary: "#FEF3C7",
    },
    logo: "/logos/faculties/management.png",
    totalPoints: 320,
    position: 5,
    sportsParticipated: ["Cricket", "Football", "Basketball", "Table Tennis"],
    achievements: [
      { sport: "Table Tennis", position: "Runner-up", year: 2024 },
    ]
  },
  {
    id: "fol",
    name: "Faculty of Law",
    shortName: "FOL",
    colors: {
      primary: "#EF4444", // Red
      secondary: "#FEE2E2",
    },
    logo: "/logos/faculties/law.png",
    totalPoints: 280,
    position: 6,
    sportsParticipated: ["Football", "Cricket", "Volleyball", "Badminton"],
    achievements: [
      { sport: "Badminton", position: "Semi-finalists", year: 2024 },
    ]
  },
  {
    id: "foe",
    name: "Faculty of Education",
    shortName: "FOE",
    colors: {
      primary: "#06B6D4", // Cyan
      secondary: "#CFFAFE",
    },
    logo: "/logos/faculties/education.png",
    totalPoints: 260,
    position: 7,
    sportsParticipated: ["Volleyball", "Netball", "Badminton", "Athletics"],
    achievements: [
      { sport: "Netball", position: "Champions", year: 2024 },
    ]
  },
  {
    id: "fot",
    name: "Faculty of Technology",
    shortName: "FOT",
    colors: {
      primary: "#8B5CF6", // Violet
      secondary: "#EDE9FE",
    },
    logo: "/logos/faculties/technology.png",
    totalPoints: 240,
    position: 8,
    sportsParticipated: ["Basketball", "Football", "Cricket", "Athletics"],
    achievements: [
      { sport: "Athletics", position: "Runner-up", year: 2024 },
    ]
  },
  {
    id: "fon",
    name: "Faculty of Nursing",
    shortName: "FON",
    colors: {
      primary: "#EC4899", // Pink
      secondary: "#FCE7F3",
    },
    logo: "/logos/faculties/nursing.png",
    totalPoints: 215,
    position: 9,
    sportsParticipated: ["Netball", "Volleyball", "Badminton", "Table Tennis"],
    achievements: [
      { sport: "Netball", position: "Runner-up", year: 2024 },
    ]
  },
  {
    id: "fim",
    name: "Faculty of Indigenous Medicine",
    shortName: "FIM",
    colors: {
      primary: "#14B8A6", // Teal
      secondary: "#CCFBF1",
    },
    logo: "/logos/faculties/indigenous-medicine.png",
    totalPoints: 190,
    position: 10,
    sportsParticipated: ["Cricket", "Volleyball", "Athletics", "Table Tennis"],
    achievements: [
      { sport: "Athletics", position: "Third place", year: 2024 },
    ]
  },
  {
    id: "spc",
    name: "Sri Palee Campus",
    shortName: "SPC",
    colors: {
      primary: "#F97316", // Orange
      secondary: "#FFEDD5",
    },
    logo: "/logos/faculties/sri-palee.png",
    totalPoints: 165,
    position: 11,
    sportsParticipated: ["Cricket", "Football", "Athletics", "Volleyball"],
    achievements: [
      { sport: "Cricket", position: "Quarter-finalists", year: 2024 },
    ]
  },
];

// Helper function to get faculty by ID
export const getFacultyById = (id: string): Faculty | undefined => {
  return faculties.find(faculty => faculty.id === id);
};

// Helper function to get top N faculties
export const getTopFaculties = (n: number = 5): Faculty[] => {
  return faculties
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, n);
};

// Helper function to get faculty color
export const getFacultyColor = (facultyId: string): string => {
  const faculty = getFacultyById(facultyId);
  return faculty?.colors.primary || "#DC2626";
};

// Helper function to get faculty ID by name
export const getFacultyIdByName = (name: string): string | undefined => {
  const faculty = faculties.find(f => f.name === name || f.shortName === name);
  return faculty?.id;
};
