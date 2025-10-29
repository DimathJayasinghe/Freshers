import { supabase, hasSupabaseEnv } from './supabaseClient';
import type { TeamData } from '@/data/leaderboardData';
import type { LiveMatch, ScheduleMatch } from '@/data/homeData';
import type { Sport } from '@/data/sportsData';
import type { CompletedEvent } from '@/data/resultsData';

// Small time formatting helper: 4:30 PM etc.
function formatTimeFromISO(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Sports list
export async function fetchSports(): Promise<Sport[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase
    .from('sports')
    .select('id,name,category')
    .order('name', { ascending: true });
  if (error) {
    console.error('[API] fetchSports error', error);
    throw error;
  }
  return (data || []) as Sport[];
}

// Faculties overview
export type FacultyOverview = {
  id: string;
  name: string;
  shortName: string;
  colors: { primary: string; secondary: string };
  logo: string;
  totalPoints: number;
  rank: number | null;
  sportsCount: number;
  latestAchievement?: { sport: string | null; position: string; year: number | null } | null;
};

type FacultyRow = { id: string; name: string; short_name: string; primary_color: string; secondary_color: string; logo_url: string };
type FacultySportsRow = { faculty_id: string };
type FacultyAchievementRow = { faculty_id: string; position: string; year: number | null; sports?: { name: string } | null };

export async function fetchFacultiesOverview(): Promise<FacultyOverview[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const [facRes, lbRes, fsRes, achRes] = await Promise.all([
    supabase.from('faculties').select('id,name,short_name,primary_color,secondary_color,logo_url'),
    supabase.from('leaderboard').select('name,rank,total_points'),
    supabase.from('faculty_sports').select('faculty_id'),
    supabase.from('faculty_achievements').select('faculty_id, position, year, sports(name)').order('year', { ascending: false }),
  ]);

  if (facRes.error) { console.error('[API] faculties error', facRes.error); throw facRes.error; }
  if (lbRes.error) { console.error('[API] leaderboard error', lbRes.error); throw lbRes.error; }
  if (fsRes.error) { console.error('[API] faculty_sports error', fsRes.error); throw fsRes.error; }
  if (achRes.error) { console.error('[API] achievements error', achRes.error); throw achRes.error; }

  const faculties = (facRes.data || []) as FacultyRow[];
  const leaderboard = (lbRes.data || []) as { name: string; rank: number; total_points: number }[];
  const sportsCounts = new Map<string, number>();
  (fsRes.data || [] as FacultySportsRow[]).forEach((r) => {
    sportsCounts.set(r.faculty_id, (sportsCounts.get(r.faculty_id) || 0) + 1);
  });

  const latestByFaculty = new Map<string, { sport: string | null; position: string; year: number | null }>();
  (achRes.data || [] as (FacultyAchievementRow & { sports?: { name: string } | { name: string }[] | null })[]).forEach((r) => {
  const sportName = Array.isArray(r.sports) ? (r.sports as { name: string }[])[0]?.name ?? null : (r.sports as { name: string } | null | undefined)?.name ?? null;
    if (!latestByFaculty.has(r.faculty_id)) {
      latestByFaculty.set(r.faculty_id, {
        sport: sportName,
        position: r.position,
        year: r.year ?? null,
      });
    }
  });

  return faculties.map((f) => {
    const lb = leaderboard.find((l) => l.name === f.name);
    return {
      id: f.id,
      name: f.name,
      shortName: f.short_name,
      colors: { primary: f.primary_color, secondary: f.secondary_color },
      logo: f.logo_url,
      totalPoints: lb?.total_points ?? 0,
      rank: lb?.rank ?? null,
      sportsCount: sportsCounts.get(f.id) || 0,
      latestAchievement: latestByFaculty.get(f.id) || null,
    } satisfies FacultyOverview;
  });
}

// Faculty detail
export type FacultyDetailData = {
  id: string;
  name: string;
  shortName: string;
  colors: { primary: string; secondary: string };
  logo: string;
  points: { mens: number; womens: number; total: number };
  sports: string[];
  achievements: { sport: string | null; position: string; year: number | null }[];
  team: { name: string; role: string; sport: string | null }[];
};

export async function fetchFacultyDetail(facultyId: string): Promise<FacultyDetailData | null> {
  if (!hasSupabaseEnv || !supabase) return null;
  const [fRes, pRes, fsRes, achRes, tmRes] = await Promise.all([
    supabase.from('faculties').select('id,name,short_name,primary_color,secondary_color,logo_url').eq('id', facultyId).single(),
    supabase.from('faculty_points').select('mens_points,womens_points,total_points').eq('faculty_id', facultyId).single(),
    supabase.from('faculty_sports').select('sports(name)').eq('faculty_id', facultyId),
    supabase.from('faculty_achievements').select('position,year,sports(name)').eq('faculty_id', facultyId).order('year', { ascending: false }),
    supabase.from('faculty_team_members').select('name,role,sports(name)').eq('faculty_id', facultyId),
  ]);

  if (fRes.error) { console.error('[API] faculty error', fRes.error); throw fRes.error; }
  const f = fRes.data;
  if (!f) return null;

  if (pRes.error && pRes.error.code !== 'PGRST116') { console.error('[API] points error', pRes.error); throw pRes.error; }
  if (fsRes.error) { console.error('[API] fs error', fsRes.error); throw fsRes.error; }
  if (achRes.error) { console.error('[API] ach error', achRes.error); throw achRes.error; }
  if (tmRes.error) { console.error('[API] team error', tmRes.error); throw tmRes.error; }

  const sports = ((fsRes.data || []) as { sports?: { name: string } | { name: string }[] | null }[])
    .map((r) => (Array.isArray(r.sports) ? (r.sports as { name: string }[])[0]?.name : (r.sports as { name: string } | null | undefined)?.name))
    .filter(Boolean) as string[];
  const achievements = ((achRes.data || []) as { position: string; year: number | null; sports?: { name: string } | { name: string }[] | null }[])
    .map((r) => ({ sport: (Array.isArray(r.sports) ? (r.sports as { name: string }[])[0]?.name : (r.sports as { name: string } | null | undefined)?.name) ?? null, position: r.position, year: r.year ?? null }));
  const team = ((tmRes.data || []) as { name: string; role: string; sports?: { name: string } | { name: string }[] | null }[])
    .map((r) => ({ name: r.name, role: r.role, sport: (Array.isArray(r.sports) ? (r.sports as { name: string }[])[0]?.name : (r.sports as { name: string } | null | undefined)?.name) ?? null }));

  return {
    id: f.id,
    name: f.name,
    shortName: f.short_name,
    colors: { primary: f.primary_color, secondary: f.secondary_color },
    logo: f.logo_url,
    points: {
      mens: pRes.data?.mens_points ?? 0,
      womens: pRes.data?.womens_points ?? 0,
      total: pRes.data?.total_points ?? 0,
    },
    sports,
    achievements,
    team,
  };
}

// Full schedule calendar for Lineup page
export type ScheduleDay = { date: string; events: { sport: string; time: string; venue: string }[] };
export async function fetchScheduleCalendar(): Promise<ScheduleDay[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase
    .from('scheduled_events')
    .select('event_date, sport_label, start_time, time_range, venue, sports(name)')
    .order('event_date', { ascending: true })
    .order('start_time', { ascending: true, nullsFirst: false });
  if (error) { console.error('[API] fetchScheduleCalendar error', error); throw error; }

  const byDate = new Map<string, { sport: string; time: string; venue: string }[]>();
  (data || [] as { event_date: string; sport_label: string | null; start_time: string | null; time_range: string | null; venue: string; sports?: { name: string } | { name: string }[] | null }[])
    .forEach((r) => {
    const date = r.event_date as string;
    const time = r.time_range ?? (r.start_time ? formatTimeFromISO(`1970-01-01T${r.start_time}Z`) : '');
    const sport = r.sport_label ?? (Array.isArray(r.sports) ? (r.sports as { name: string }[])[0]?.name : (r.sports as { name: string } | null | undefined)?.name) ?? 'Event';
    const entry = { sport, time, venue: r.venue as string };
    byDate.set(date, [...(byDate.get(date) || []), entry]);
  });

  return Array.from(byDate.entries()).map(([date, events]) => ({ date: new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), events }));
}

// Results (Completed events) - expects a view 'results_view' with aggregated positions JSON
// Shape: id, sport, event, category, gender, date, time, positions(jsonb array of { place, faculty })
export async function fetchResults(): Promise<CompletedEvent[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase
    .from('results_view')
    .select('id,sport,event,category,gender,date,time,positions');
  if (error) {
    console.error('[API] fetchResults error', error);
    throw error;
  }
  const rows = (data || []) as { id: number; sport: string; event: string | null; category: CompletedEvent['category']; gender: CompletedEvent['gender']; date: string; time: string; positions: { place: number; faculty: string }[] }[];
  return rows.map(r => ({
    id: r.id,
    sport: r.sport,
    event: r.event ?? undefined,
    category: r.category,
    gender: r.gender,
    date: r.date,
    time: r.time,
    positions: Array.isArray(r.positions) ? r.positions : [],
  } satisfies CompletedEvent));
}
type LeaderboardRow = {
  rank: number;
  name: string;
  code: string;
  mens_points: number | null;
  womens_points: number | null;
  total_points: number | null;
};

export async function fetchLeaderboard(): Promise<TeamData[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase
    .from('leaderboard')
    .select('rank,name,code,mens_points,womens_points,total_points')
    .order('rank', { ascending: true });
  if (error) {
    console.error('[API] fetchLeaderboard error', error);
    throw error;
  }
  return (data as LeaderboardRow[] | null || []).map((row) => ({
    rank: row.rank,
    name: row.name,
    code: row.code,
    mensPoints: row.mens_points ?? 0,
    womensPoints: row.womens_points ?? 0,
    totalPoints: row.total_points ?? 0,
  }));
}

type LiveMatchRow = {
  id: number;
  sport: string;
  venue: string;
  team1: string;
  team2: string;
  status: string;
  status_color: string | null;
};

export async function fetchLiveMatches(): Promise<LiveMatch[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase
    .from('live_matches')
    .select('id,sport,venue,team1,team2,status,status_color')
    .order('id', { ascending: true });
  if (error) {
    console.error('[API] fetchLiveMatches error', error);
    throw error;
  }
  return (data as LiveMatchRow[] | null || []).map((row) => ({
    id: row.id,
    sport: row.sport,
    venue: row.venue,
    team1: row.team1,
    team2: row.team2,
    status: row.status,
    statusColor: row.status_color ?? 'text-green-400',
  }));
}

type ScheduledEventRow = {
  id: number;
  event_date: string; // ISO date
  sport_label: string | null;
  time_range: string | null;
  start_time: string | null;
  end_time: string | null;
  venue: string;
  // PostgREST embed might come as a single object or an array depending on config
  sports?: { name: string } | { name: string }[] | null;
};

export async function fetchTodaySchedule(): Promise<ScheduleMatch[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD

  const { data, error } = await supabase
    .from('scheduled_events')
    .select('id, event_date, sport_label, time_range, start_time, end_time, venue, sports(name)')
    .eq('event_date', dateStr)
    .order('start_time', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('[API] fetchTodaySchedule error', error);
    throw error;
  }

  return (data as ScheduledEventRow[] | null || []).map((row) => {
    const sportObj = Array.isArray(row.sports) ? row.sports[0] : row.sports;
    return {
    id: row.id,
    time: row.time_range ?? (row.start_time ? formatTimeFromISO(`1970-01-01T${row.start_time}Z`) : ''),
      sport: row.sport_label ?? sportObj?.name ?? 'Event',
    match: row.sport_label ?? 'Match',
    team1: '',
    team2: '',
    venue: row.venue,
    } satisfies ScheduleMatch;
  });
}
