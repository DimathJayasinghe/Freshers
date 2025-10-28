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
  description: string;
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
    id: "arts",
    name: "Faculty of Arts",
    shortName: "Arts",
    colors: {
      primary: "#DC2626", // Red
      secondary: "#FEE2E2",
    },
    logo: "/logos/faculties/arts.png",
    description: "Representing tradition, culture, and competitive spirit",
    totalPoints: 245,
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
    id: "science",
    name: "Faculty of Science",
    shortName: "Science",
    colors: {
      primary: "#3B82F6", // Blue
      secondary: "#DBEAFE",
    },
    logo: "/logos/faculties/science.png",
    description: "Excellence in both academics and athletics",
    totalPoints: 238,
    position: 2,
    sportsParticipated: ["Cricket", "Basketball", "Tennis", "Badminton", "Athletics"],
    achievements: [
      { sport: "Basketball", position: "Champions", year: 2024 },
      { sport: "Cricket", position: "Semi-finalists", year: 2024 },
    ]
  },
  {
    id: "medicine",
    name: "Faculty of Medicine",
    shortName: "Medicine",
    colors: {
      primary: "#22C55E", // Green
      secondary: "#DCFCE7",
    },
    logo: "/logos/faculties/medicine.png",
    description: "Healing lives, dominating courts",
    totalPoints: 220,
    position: 3,
    sportsParticipated: ["Basketball", "Volleyball", "Badminton", "Table Tennis"],
    achievements: [
      { sport: "Volleyball", position: "Champions", year: 2024 },
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
    description: "Coding champions, sports enthusiasts",
    totalPoints: 215,
    position: 4,
    sportsParticipated: ["Cricket", "Football", "Basketball", "Badminton", "Chess"],
    achievements: [
      { sport: "Chess", position: "Champions", year: 2024 },
      { sport: "Football", position: "Quarter-finalists", year: 2024 },
    ]
  },
  {
    id: "management",
    name: "Faculty of Management & Finance",
    shortName: "Management",
    colors: {
      primary: "#F59E0B", // Amber
      secondary: "#FEF3C7",
    },
    logo: "/logos/faculties/management.png",
    description: "Strategic minds, competitive hearts",
    totalPoints: 205,
    position: 5,
    sportsParticipated: ["Cricket", "Football", "Basketball", "Table Tennis"],
    achievements: [
      { sport: "Table Tennis", position: "Runner-up", year: 2024 },
    ]
  },
  {
    id: "law",
    name: "Faculty of Law",
    shortName: "Law",
    colors: {
      primary: "#EF4444", // Red
      secondary: "#FEE2E2",
    },
    logo: "/logos/faculties/law.png",
    description: "Justice on the field, champions at heart",
    totalPoints: 198,
    position: 6,
    sportsParticipated: ["Football", "Cricket", "Volleyball", "Badminton"],
    achievements: [
      { sport: "Badminton", position: "Semi-finalists", year: 2024 },
    ]
  },
  {
    id: "education",
    name: "Faculty of Education",
    shortName: "Education",
    colors: {
      primary: "#06B6D4", // Cyan
      secondary: "#CFFAFE",
    },
    logo: "/logos/faculties/education.png",
    description: "Teaching excellence, sporting prowess",
    totalPoints: 185,
    position: 7,
    sportsParticipated: ["Volleyball", "Netball", "Badminton", "Athletics"],
    achievements: [
      { sport: "Netball", position: "Champions", year: 2024 },
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
