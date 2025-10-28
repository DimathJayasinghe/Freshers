export interface TeamData {
  rank: number;
  name: string;
  code: string;
  mensPoints: number;
  womensPoints: number;
  totalPoints: number;
}

export const leaderboardData: TeamData[] = [
  { rank: 1, name: "Faculty of Arts", code: "FOA", mensPoints: 245, womensPoints: 205, totalPoints: 450 },
  { rank: 2, name: "Faculty of Medicine", code: "FOM", mensPoints: 230, womensPoints: 190, totalPoints: 420 },
  { rank: 3, name: "Faculty of Science", code: "FOS", mensPoints: 200, womensPoints: 180, totalPoints: 380 },
  { rank: 4, name: "University of Colombo School of Computing", code: "UCSC", mensPoints: 185, womensPoints: 165, totalPoints: 350 },
  { rank: 5, name: "Faculty of Management & Finance", code: "FMF", mensPoints: 170, womensPoints: 150, totalPoints: 320 },
  { rank: 6, name: "Faculty of Law", code: "FOL", mensPoints: 150, womensPoints: 130, totalPoints: 280 },
  { rank: 7, name: "Faculty of Education", code: "FOE", mensPoints: 140, womensPoints: 120, totalPoints: 260 },
  { rank: 8, name: "Faculty of Technology", code: "FOT", mensPoints: 130, womensPoints: 110, totalPoints: 240 },
  { rank: 9, name: "Faculty of Nursing", code: "FON", mensPoints: 115, womensPoints: 100, totalPoints: 215 },
  { rank: 10, name: "Faculty of Indigenous Medicine", code: "FIM", mensPoints: 100, womensPoints: 90, totalPoints: 190 },
  { rank: 11, name: "Sri Palee Campus", code: "SPC", mensPoints: 85, womensPoints: 80, totalPoints: 165 },
];
