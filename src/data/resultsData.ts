// Results Data Types and Sample Data

export interface CompletedEvent {
  id: number;
  sport: string;
  event?: string;
  category: "Team Sport" | "Individual Sport" | "Athletics" | "Swimming";
  gender: "Men's" | "Women's" | "Mixed";
  date: string;
  time: string;
  positions: Array<{
    place: number;
    faculty: string;
  }>;
}

export const completedEvents: CompletedEvent[] = [
  // Athletics - 100m Sprint Men's
  {
    id: 1,
    sport: "Athletics",
    event: "100m Sprint",
    category: "Athletics",
    gender: "Men's",
    date: "Oct 27, 2025",
    time: "3:30 PM",
    positions: [
      { place: 1, faculty: "Faculty of Science" },
      { place: 2, faculty: "University of Colombo School of Computing" },
      { place: 3, faculty: "Faculty of Arts" },
      { place: 4, faculty: "Faculty of Medicine" },
      { place: 5, faculty: "Faculty of Management & Finance" },
    ],
  },
  // Athletics - Long Jump Women's
  {
    id: 2,
    sport: "Athletics",
    event: "Long Jump",
    category: "Athletics",
    gender: "Women's",
    date: "Oct 27, 2025",
    time: "2:15 PM",
    positions: [
      { place: 1, faculty: "Faculty of Arts" },
      { place: 2, faculty: "Faculty of Medicine" },
      { place: 3, faculty: "Faculty of Science" },
      { place: 4, faculty: "Faculty of Education" },
    ],
  },
  // Cricket - Men's
  {
    id: 3,
    sport: "Cricket",
    category: "Team Sport",
    gender: "Men's",
    date: "Oct 27, 2025",
    time: "10:00 AM",
    positions: [
      { place: 1, faculty: "Faculty of Law" },
      { place: 2, faculty: "Faculty of Management & Finance" },
      { place: 3, faculty: "Faculty of Science" },
      { place: 4, faculty: "University of Colombo School of Computing" },
      { place: 5, faculty: "Faculty of Arts" },
      { place: 6, faculty: "Faculty of Medicine" },
      { place: 7, faculty: "Faculty of Education" },
      { place: 8, faculty: "Faculty of Technology" },
    ],
  },
  // Cricket - Women's
  {
    id: 4,
    sport: "Cricket",
    category: "Team Sport",
    gender: "Women's",
    date: "Oct 27, 2025",
    time: "2:00 PM",
    positions: [
      { place: 1, faculty: "Faculty of Science" },
      { place: 2, faculty: "Faculty of Arts" },
      { place: 3, faculty: "Faculty of Medicine" },
      { place: 4, faculty: "Faculty of Management & Finance" },
      { place: 5, faculty: "University of Colombo School of Computing" },
      { place: 6, faculty: "Faculty of Nursing" },
    ],
  },
  // Basketball - Men's
  {
    id: 5,
    sport: "Basketball",
    category: "Team Sport",
    gender: "Men's",
    date: "Oct 26, 2025",
    time: "4:00 PM",
    positions: [
      { place: 1, faculty: "Faculty of Management & Finance" },
      { place: 2, faculty: "University of Colombo School of Computing" },
    ],
  },
  // Basketball - Women's
  {
    id: 6,
    sport: "Basketball",
    category: "Team Sport",
    gender: "Women's",
    date: "Oct 26, 2025",
    time: "6:00 PM",
    positions: [
      { place: 1, faculty: "Faculty of Arts" },
      { place: 2, faculty: "Faculty of Medicine" },
    ],
  },
  // Football - Men's
  {
    id: 7,
    sport: "Football",
    category: "Team Sport",
    gender: "Men's",
    date: "Oct 25, 2025",
    time: "5:30 PM",
    positions: [
      { place: 1, faculty: "Faculty of Education" },
      { place: 2, faculty: "Faculty of Law" },
    ],
  },
  // Football - Women's
  {
    id: 8,
    sport: "Football",
    category: "Team Sport",
    gender: "Women's",
    date: "Oct 25, 2025",
    time: "3:30 PM",
    positions: [
      { place: 1, faculty: "Faculty of Science" },
      { place: 2, faculty: "University of Colombo School of Computing" },
    ],
  },
  // Volleyball - Men's
  {
    id: 9,
    sport: "Volleyball",
    category: "Team Sport",
    gender: "Men's",
    date: "Oct 27, 2025",
    time: "11:00 AM",
    positions: [
      { place: 1, faculty: "Faculty of Arts" },
      { place: 2, faculty: "Faculty of Science" },
    ],
  },
  // Volleyball - Women's
  {
    id: 10,
    sport: "Volleyball",
    category: "Team Sport",
    gender: "Women's",
    date: "Oct 27, 2025",
    time: "1:00 PM",
    positions: [
      { place: 1, faculty: "Faculty of Medicine" },
      { place: 2, faculty: "Faculty of Management & Finance" },
    ],
  },
  // Badminton - Men's Singles Final
  {
    id: 11,
    sport: "Badminton",
    event: "Singles Final",
    category: "Individual Sport",
    gender: "Men's",
    date: "Oct 26, 2025",
    time: "1:00 PM",
    positions: [
      { place: 1, faculty: "University of Colombo School of Computing" },
      { place: 2, faculty: "Faculty of Arts" },
      { place: 3, faculty: "Faculty of Medicine" },
      { place: 4, faculty: "Faculty of Science" },
    ],
  },
  // Badminton - Women's Singles Final
  {
    id: 12,
    sport: "Badminton",
    event: "Singles Final",
    category: "Individual Sport",
    gender: "Women's",
    date: "Oct 26, 2025",
    time: "3:00 PM",
    positions: [
      { place: 1, faculty: "Faculty of Science" },
      { place: 2, faculty: "Faculty of Law" },
      { place: 3, faculty: "University of Colombo School of Computing" },
      { place: 4, faculty: "Faculty of Arts" },
    ],
  },
  // Badminton - Men's Doubles
  {
    id: 13,
    sport: "Badminton",
    event: "Doubles",
    category: "Individual Sport",
    gender: "Men's",
    date: "Oct 26, 2025",
    time: "10:00 AM",
    positions: [
      { place: 1, faculty: "Faculty of Medicine" },
      { place: 2, faculty: "Faculty of Science" },
      { place: 3, faculty: "Faculty of Arts" },
      { place: 4, faculty: "Faculty of Management & Finance" },
    ],
  },
  // Badminton - Women's Doubles
  {
    id: 14,
    sport: "Badminton",
    event: "Doubles",
    category: "Individual Sport",
    gender: "Women's",
    date: "Oct 26, 2025",
    time: "11:30 AM",
    positions: [
      { place: 1, faculty: "Faculty of Arts" },
      { place: 2, faculty: "University of Colombo School of Computing" },
      { place: 3, faculty: "Faculty of Science" },
      { place: 4, faculty: "Faculty of Medicine" },
    ],
  },
  // Badminton - Mixed Doubles
  {
    id: 15,
    sport: "Badminton",
    event: "Mixed Doubles",
    category: "Individual Sport",
    gender: "Mixed",
    date: "Oct 26, 2025",
    time: "4:30 PM",
    positions: [
      { place: 1, faculty: "Faculty of Law" },
      { place: 2, faculty: "Faculty of Science" },
      { place: 3, faculty: "Faculty of Arts" },
      { place: 4, faculty: "University of Colombo School of Computing" },
    ],
  },
  // Table Tennis - Men's Singles
  {
    id: 16,
    sport: "Table Tennis",
    event: "Singles",
    category: "Individual Sport",
    gender: "Men's",
    date: "Oct 25, 2025",
    time: "2:00 PM",
    positions: [
      { place: 1, faculty: "Faculty of Management & Finance" },
      { place: 2, faculty: "Faculty of Science" },
      { place: 3, faculty: "Faculty of Medicine" },
      { place: 4, faculty: "Faculty of Arts" },
      { place: 5, faculty: "University of Colombo School of Computing" },
    ],
  },
  // Table Tennis - Women's Singles
  {
    id: 17,
    sport: "Table Tennis",
    event: "Singles",
    category: "Individual Sport",
    gender: "Women's",
    date: "Oct 25, 2025",
    time: "3:30 PM",
    positions: [
      { place: 1, faculty: "Faculty of Arts" },
      { place: 2, faculty: "Faculty of Science" },
      { place: 3, faculty: "Faculty of Law" },
      { place: 4, faculty: "Faculty of Medicine" },
    ],
  },
  // Table Tennis - Men's Doubles
  {
    id: 18,
    sport: "Table Tennis",
    event: "Doubles",
    category: "Individual Sport",
    gender: "Men's",
    date: "Oct 25, 2025",
    time: "5:00 PM",
    positions: [
      { place: 1, faculty: "University of Colombo School of Computing" },
      { place: 2, faculty: "Faculty of Management & Finance" },
      { place: 3, faculty: "Faculty of Science" },
    ],
  },
  // Athletics - 200m Sprint Men's
  {
    id: 19,
    sport: "Athletics",
    event: "200m Sprint",
    category: "Athletics",
    gender: "Men's",
    date: "Oct 27, 2025",
    time: "4:00 PM",
    positions: [
      { place: 1, faculty: "Faculty of Arts" },
      { place: 2, faculty: "Faculty of Science" },
      { place: 3, faculty: "Faculty of Medicine" },
      { place: 4, faculty: "University of Colombo School of Computing" },
      { place: 5, faculty: "Faculty of Education" },
    ],
  },
  // Athletics - 200m Sprint Women's
  {
    id: 20,
    sport: "Athletics",
    event: "200m Sprint",
    category: "Athletics",
    gender: "Women's",
    date: "Oct 27, 2025",
    time: "4:30 PM",
    positions: [
      { place: 1, faculty: "Faculty of Science" },
      { place: 2, faculty: "Faculty of Arts" },
      { place: 3, faculty: "Faculty of Medicine" },
      { place: 4, faculty: "Faculty of Education" },
    ],
  },
  // Athletics - 400m Men's
  {
    id: 21,
    sport: "Athletics",
    event: "400m",
    category: "Athletics",
    gender: "Men's",
    date: "Oct 27, 2025",
    time: "5:00 PM",
    positions: [
      { place: 1, faculty: "University of Colombo School of Computing" },
      { place: 2, faculty: "Faculty of Science" },
      { place: 3, faculty: "Faculty of Arts" },
      { place: 4, faculty: "Faculty of Management & Finance" },
      { place: 5, faculty: "Faculty of Medicine" },
    ],
  },
  // Athletics - High Jump Men's
  {
    id: 22,
    sport: "Athletics",
    event: "High Jump",
    category: "Athletics",
    gender: "Men's",
    date: "Oct 27, 2025",
    time: "1:00 PM",
    positions: [
      { place: 1, faculty: "Faculty of Medicine" },
      { place: 2, faculty: "Faculty of Arts" },
      { place: 3, faculty: "Faculty of Science" },
      { place: 4, faculty: "Faculty of Education" },
    ],
  },
  // Athletics - Shot Put Women's
  {
    id: 23,
    sport: "Athletics",
    event: "Shot Put",
    category: "Athletics",
    gender: "Women's",
    date: "Oct 27, 2025",
    time: "11:30 AM",
    positions: [
      { place: 1, faculty: "Faculty of Education" },
      { place: 2, faculty: "Faculty of Science" },
      { place: 3, faculty: "Faculty of Arts" },
      { place: 4, faculty: "Faculty of Medicine" },
    ],
  },
  // Tennis - Men's Singles
  {
    id: 24,
    sport: "Tennis",
    event: "Singles",
    category: "Individual Sport",
    gender: "Men's",
    date: "Oct 24, 2025",
    time: "2:00 PM",
    positions: [
      { place: 1, faculty: "Faculty of Law" },
      { place: 2, faculty: "Faculty of Arts" },
      { place: 3, faculty: "Faculty of Science" },
      { place: 4, faculty: "Faculty of Management & Finance" },
    ],
  },
  // Tennis - Women's Singles
  {
    id: 25,
    sport: "Tennis",
    event: "Singles",
    category: "Individual Sport",
    gender: "Women's",
    date: "Oct 24, 2025",
    time: "4:00 PM",
    positions: [
      { place: 1, faculty: "Faculty of Science" },
      { place: 2, faculty: "Faculty of Medicine" },
      { place: 3, faculty: "Faculty of Arts" },
      { place: 4, faculty: "University of Colombo School of Computing" },
    ],
  },
  // Chess - Men's
  {
    id: 26,
    sport: "Chess",
    event: "Individual",
    category: "Individual Sport",
    gender: "Men's",
    date: "Oct 23, 2025",
    time: "10:00 AM",
    positions: [
      { place: 1, faculty: "University of Colombo School of Computing" },
      { place: 2, faculty: "Faculty of Science" },
      { place: 3, faculty: "Faculty of Arts" },
      { place: 4, faculty: "Faculty of Law" },
      { place: 5, faculty: "Faculty of Medicine" },
    ],
  },
  // Chess - Women's
  {
    id: 27,
    sport: "Chess",
    event: "Individual",
    category: "Individual Sport",
    gender: "Women's",
    date: "Oct 23, 2025",
    time: "2:00 PM",
    positions: [
      { place: 1, faculty: "Faculty of Arts" },
      { place: 2, faculty: "Faculty of Science" },
      { place: 3, faculty: "University of Colombo School of Computing" },
      { place: 4, faculty: "Faculty of Medicine" },
    ],
  },
];

// Helper function to get results by sport
export const getResultsBySport = (sport: string): CompletedEvent[] => {
  return completedEvents.filter(event => event.sport === sport);
};

// Helper function to get recent results
export const getRecentResults = (count: number = 6): CompletedEvent[] => {
  return completedEvents.slice(0, count);
};
