// Results Data Types

export interface CompletedEvent {
  id: number;
  sport: string;
  event?: string;
  category: "Team Sport" | "Individual Sport" | "Athletics" | "Swimming";
  gender: "Men's" | "Women's" | "Mixed";
  date: string;
  time: string;
  venue?: string;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  positions: Array<{
    place: number;
    faculty: string;
  }>;
}
