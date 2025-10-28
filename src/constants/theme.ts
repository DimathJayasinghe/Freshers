// UOC Freshers' Meet 2025 Theme Configuration

export const THEME_COLORS = {
  // Primary Brand Colors
  primary: {
    red: '#DC2626',      // Red-600
    darkRed: '#991B1B',  // Red-800
    lightRed: '#FEE2E2', // Red-100
  },
  
  // Secondary Colors
  secondary: {
    yellow: '#EAB308',    // Yellow-500
    gold: '#F59E0B',      // Amber-500
    lightYellow: '#FEF3C7', // Yellow-100
  },
  
  // Accent Colors
  accent: {
    blue: '#3B82F6',     // Blue-500
    green: '#22C55E',    // Green-500
    purple: '#A855F7',   // Purple-500
  },
  
  // Neutral Colors
  neutral: {
    black: '#000000',
    darkGray: '#111827',  // Gray-900
    mediumGray: '#6B7280', // Gray-500
    lightGray: '#F3F4F6',  // Gray-100
    white: '#FFFFFF',
  },
  
  // Status Colors
  status: {
    live: '#EF4444',      // Red-500
    upcoming: '#3B82F6',  // Blue-500
    completed: '#22C55E', // Green-500
  }
};

export const THEME_GRADIENTS = {
  primary: 'from-red-950 via-black to-gray-900',
  card: 'from-red-950/50 via-gray-900 to-black',
  text: 'from-red-500 via-yellow-500 to-red-500',
  button: 'from-red-600 to-red-700',
  highlight: 'from-yellow-500 to-amber-600',
};

export const SPORT_COLORS: Record<string, string> = {
  Cricket: 'bg-blue-600',
  Basketball: 'bg-orange-600',
  Football: 'bg-green-600',
  Volleyball: 'bg-purple-600',
  Badminton: 'bg-yellow-600',
  'Table Tennis': 'bg-pink-600',
  Tennis: 'bg-cyan-600',
  Netball: 'bg-indigo-600',
  Chess: 'bg-gray-600',
  Athletics: 'bg-red-600',
  Swimming: 'bg-blue-500',
  Rugby: 'bg-emerald-700',
};

export const EVENT_INFO = {
  name: "UOC Freshers' Meet 2025",
  university: "University of Colombo",
  year: 2025,
  shortName: "Freshers' Meet 2025",
  tagline: "Unite. Compete. Celebrate.",
};
