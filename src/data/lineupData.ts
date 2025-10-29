export interface ScheduleEvent {
  sport: string;
  time: string;
  venue: string;
}

export interface ScheduleDay {
  date: string;
  events: ScheduleEvent[];
}

export const scheduleData: ScheduleDay[] = [
  {
    date: "November 21, 2025",
    events: [
      { sport: "Athletics (Track & Field)", time: "8:00 AM - 12:00 PM", venue: "University Ground" },
      { sport: "Cricket (Men's & Women's)", time: "2:00 PM - 6:00 PM", venue: "Cricket Ground" }
    ]
  },
  {
    date: "November 22, 2025",
    events: [
      { sport: "Football (Men's)", time: "9:00 AM - 1:00 PM", venue: "Main Field" },
      { sport: "Netball (Women's)", time: "2:00 PM - 5:00 PM", venue: "Netball Court" }
    ]
  },
  {
    date: "November 23, 2025",
    events: [
      { sport: "Basketball (Men's & Women's)", time: "8:00 AM - 12:00 PM", venue: "Indoor Stadium" },
      { sport: "Volleyball (Men's & Women's)", time: "2:00 PM - 6:00 PM", venue: "Volleyball Court" }
    ]
  },
  {
    date: "November 24, 2025",
    events: [
      { sport: "Badminton (Singles)", time: "9:00 AM - 1:00 PM", venue: "Indoor Stadium Hall 2" },
      { sport: "Table Tennis (Singles)", time: "2:00 PM - 6:00 PM", venue: "Sports Complex" }
    ]
  },
  {
    date: "November 25, 2025",
    events: [
      { sport: "Chess", time: "10:00 AM - 4:00 PM", venue: "Student Center Hall" },
      { sport: "Carrom", time: "10:00 AM - 4:00 PM", venue: "Recreation Room" }
    ]
  },
  {
    date: "November 26, 2025",
    events: [
      { sport: "Swimming", time: "8:00 AM - 12:00 PM", venue: "University Pool" },
      { sport: "Water Polo", time: "2:00 PM - 5:00 PM", venue: "University Pool" }
    ]
  },
  {
    date: "November 27, 2025",
    events: [
      { sport: "Hockey (Men's)", time: "9:00 AM - 1:00 PM", venue: "Hockey Field" },
      { sport: "Rugby (Men's)", time: "2:00 PM - 6:00 PM", venue: "Rugby Ground" }
    ]
  },
  {
    date: "November 28, 2025",
    events: [
      { sport: "Tennis (Singles)", time: "8:00 AM - 12:00 PM", venue: "Tennis Courts" },
      { sport: "Squash", time: "2:00 PM - 6:00 PM", venue: "Squash Courts" }
    ]
  },
  {
    date: "November 29, 2025",
    events: [
      { sport: "Badminton (Doubles)", time: "9:00 AM - 1:00 PM", venue: "Indoor Stadium Hall 2" },
      { sport: "Table Tennis (Doubles)", time: "2:00 PM - 6:00 PM", venue: "Sports Complex" }
    ]
  },
  {
    date: "November 30, 2025",
    events: [
      { sport: "Football (Women's)", time: "9:00 AM - 1:00 PM", venue: "Main Field" },
      { sport: "Elle (Traditional)", time: "2:00 PM - 5:00 PM", venue: "Elle Ground" }
    ]
  },
  {
    date: "December 1, 2025",
    events: [
      { sport: "Basketball Semi-Finals", time: "10:00 AM - 2:00 PM", venue: "Indoor Stadium" },
      { sport: "Volleyball Semi-Finals", time: "3:00 PM - 7:00 PM", venue: "Volleyball Court" }
    ]
  },
  {
    date: "December 2, 2025",
    events: [
      { sport: "Cricket Semi-Finals", time: "9:00 AM - 5:00 PM", venue: "Cricket Ground" },
      { sport: "Football Semi-Finals", time: "2:00 PM - 6:00 PM", venue: "Main Field" }
    ]
  },
  {
    date: "December 3, 2025",
    events: [
      { sport: "Tennis Finals", time: "9:00 AM - 12:00 PM", venue: "Tennis Courts" },
      { sport: "Badminton Finals", time: "2:00 PM - 6:00 PM", venue: "Indoor Stadium Hall 2" }
    ]
  },
  {
    date: "December 4, 2025",
    events: [
      { sport: "Track & Field Finals", time: "8:00 AM - 2:00 PM", venue: "University Ground" },
      { sport: "Swimming Finals", time: "3:00 PM - 6:00 PM", venue: "University Pool" }
    ]
  },
  {
    date: "December 5, 2025",
    events: [
      { sport: "Basketball Finals", time: "10:00 AM - 1:00 PM", venue: "Indoor Stadium" },
      { sport: "Volleyball Finals", time: "3:00 PM - 6:00 PM", venue: "Volleyball Court" }
    ]
  },
  {
    date: "December 9, 2025",
    events: [
      { sport: "Cricket Finals", time: "9:00 AM - 5:00 PM", venue: "Cricket Ground" },
      { sport: "Football Finals", time: "2:00 PM - 5:00 PM", venue: "Main Field" },
      { sport: "Closing Ceremony", time: "6:00 PM - 9:00 PM", venue: "Main Auditorium" }
    ]
  }
];
