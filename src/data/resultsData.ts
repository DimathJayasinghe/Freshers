// Results Data Types

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
