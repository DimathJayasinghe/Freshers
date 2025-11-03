// Admin-specific data types used by admin pages

export type AdminResultInput = {
  sport_id: string;
  event?: string | null;
  category: 'Team Sport' | 'Individual Sport' | 'Athletics' | 'Swimming';
  gender: "Men's" | "Women's" | 'Mixed';
  event_date: string; // YYYY-MM-DD
  event_time: string; // HH:MM:SS
};

export type ResultPositionInput = { place: number; faculty_id: string };
