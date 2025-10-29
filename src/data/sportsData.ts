export interface Sport {
  id: string;
  name: string;
  category: 'Team Sport' | 'Individual Sport' | 'Athletics' | 'Swimming';
}

export const sportsData: Sport[] = [
  {
    id: 'cricket',
    name: 'Cricket',
    category: 'Team Sport'
  },
  {
    id: 'football',
    name: 'Football',
    category: 'Team Sport'
  },
  {
    id: 'basketball',
    name: 'Basketball',
    category: 'Team Sport'
  },
  {
    id: 'volleyball',
    name: 'Volleyball',
    category: 'Team Sport'
  },
  {
    id: 'netball',
    name: 'Netball',
    category: 'Team Sport'
  },
  {
    id: 'hockey',
    name: 'Hockey',
    category: 'Team Sport'
  },
  {
    id: 'rugby',
    name: 'Rugby',
    category: 'Team Sport'
  },
  {
    id: 'athletics',
    name: 'Athletics',
    category: 'Athletics'
  },
  {
    id: 'badminton',
    name: 'Badminton',
    category: 'Individual Sport'
  },
  {
    id: 'table-tennis',
    name: 'Table Tennis',
    category: 'Individual Sport'
  },
  {
    id: 'tennis',
    name: 'Tennis',
    category: 'Individual Sport'
  },
  {
    id: 'squash',
    name: 'Squash',
    category: 'Individual Sport'
  },
  {
    id: 'swimming',
    name: 'Swimming',
    category: 'Swimming'
  },
  {
    id: 'water-polo',
    name: 'Water Polo',
    category: 'Swimming'
  },
  {
    id: 'chess',
    name: 'Chess',
    category: 'Individual Sport'
  },
  {
    id: 'carrom',
    name: 'Carrom',
    category: 'Individual Sport'
  },
  {
    id: 'elle',
    name: 'Elle',
    category: 'Team Sport'
  }
];
