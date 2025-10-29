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
    .select('id,name,category,gender')
    .order('name', { ascending: true });
  if (error) {
    console.error('[API] fetchSports error', error);
    throw error;
  }
  return (data || []) as Sport[];
}

// Admin: create a new sport
export async function createSport(payload: { id: string; name: string; category: Sport['category']; gender?: 'Mens' | 'Womens' | 'Both' }) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('sports').insert([{ id: payload.id, name: payload.name, category: payload.category, gender: payload.gender ?? 'Both' }]);
  if (error) {
    console.error('[API] createSport error', error);
    throw error;
  }
  return data;
}

// Admin: update an existing sport
export async function updateSport(id: string, payload: { name?: string; category?: Sport['category']; gender?: 'Mens' | 'Womens' | 'Both' }) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('sports').update(payload).eq('id', id).select();
  if (error) {
    console.error('[API] updateSport error', error);
    throw error;
  }
  return data;
}

// Admin: delete a sport by id
export async function deleteSport(id: string) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('sports').delete().eq('id', id).select();
  if (error) {
    console.error('[API] deleteSport error', error);
    throw error;
  }
  return data;
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

// Admin: create a new faculty (optionally upload logo to Supabase storage)
export async function createFaculty(payload: {
  id: string;
  name: string;
  short_name: string;
  primary_color: string;
  secondary_color: string;
  logoFile?: File | null;
  logoUrl?: string | null;
}) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');

  let logo_url = payload.logoUrl ?? null;

  // If a file is provided, upload to 'logos' bucket under faculties/
  if (payload.logoFile) {
    const file = payload.logoFile;
    const path = `faculties/${payload.id}-${Date.now()}-${file.name}`;
    const uploadRes = await supabase.storage.from('logos').upload(path, file, { upsert: true });
    if (uploadRes.error) {
      console.error('[API] logo upload error', uploadRes.error);
      throw uploadRes.error;
    }
    const publicRes = supabase.storage.from('logos').getPublicUrl(path);
    logo_url = publicRes?.data?.publicUrl ?? `/${path}`;
  }

  const insert = {
    id: payload.id,
    name: payload.name,
    short_name: payload.short_name,
    primary_color: payload.primary_color,
    secondary_color: payload.secondary_color,
    logo_url: logo_url ?? '',
  };

  const { data, error } = await supabase.from('faculties').insert([insert]).select();
  if (error) {
    console.error('[API] createFaculty error', error);
    throw error;
  }
  return data;
}

// Admin: delete a faculty by id
export async function deleteFaculty(id: string) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('faculties').delete().eq('id', id).select();
  if (error) { console.error('[API] deleteFaculty error', error); throw error; }
  return data;
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

// Scheduled events (Lineup) CRUD
export type ScheduledEventRowFull = {
  id: number;
  event_date: string; // YYYY-MM-DD
  sport_id: string | null;
  sport_label: string | null;
  time_range: string | null;
  start_time: string | null;
  end_time: string | null;
  venue: string;
  created_at: string;
};

export async function fetchScheduledEvents(): Promise<ScheduledEventRowFull[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase
    .from('scheduled_events')
    .select('id,event_date,sport_id,sport_label,time_range,start_time,end_time,venue,created_at')
    .order('event_date', { ascending: true })
    .order('start_time', { ascending: true, nullsFirst: false });
  if (error) {
    console.error('[API] fetchScheduledEvents error', error);
    throw error;
  }
  return (data || []) as ScheduledEventRowFull[];
}

export async function createScheduledEvent(payload: {
  event_date: string; // YYYY-MM-DD
  sport_id?: string | null;
  sport_label?: string | null;
  time_range?: string | null;
  start_time?: string | null; // HH:MM:SS or HH:MM
  end_time?: string | null;
  venue: string;
}) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('scheduled_events').insert([payload]).select();
  if (error) {
    console.error('[API] createScheduledEvent error', error);
    throw error;
  }
  return data;
}

export async function updateScheduledEvent(id: number, payload: Partial<{
  event_date: string;
  sport_id: string | null;
  sport_label: string | null;
  time_range: string | null;
  start_time: string | null;
  end_time: string | null;
  venue: string;
}>) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('scheduled_events').update(payload).eq('id', id).select();
  if (error) {
    console.error('[API] updateScheduledEvent error', error);
    throw error;
  }
  return data;
}

export async function deleteScheduledEvent(id: number) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('scheduled_events').delete().eq('id', id).select();
  if (error) {
    console.error('[API] deleteScheduledEvent error', error);
    throw error;
  }
  return data;
}

// -----------------------
// Faculties list (simple)
// -----------------------
export async function fetchFacultiesList(): Promise<{ id: string; name: string; short_name: string }[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase.from('faculties').select('id,name,short_name').order('name', { ascending: true });
  if (error) { console.error('[API] fetchFacultiesList error', error); throw error; }
  return (data || []) as { id: string; name: string; short_name: string }[];
}

// -----------------------
// Results CRUD (Admin)
// -----------------------
export async function createResult(payload: {
  sport_id: string;
  event?: string | null;
  category: 'Team Sport' | 'Individual Sport' | 'Athletics' | 'Swimming';
  gender: "Men's" | "Women's" | 'Mixed';
  event_date: string; // YYYY-MM-DD
  event_time: string; // HH:MM:SS
}) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('results').insert([payload]).select();
  if (error) { console.error('[API] createResult error', error); throw error; }
  return data?.[0] as { id: number } | null;
}

export async function addResultPositions(resultId: number, positions: Array<{ place: number; faculty_id: string }>) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const rows = positions.map((p) => ({ result_id: resultId, place: p.place, faculty_id: p.faculty_id }));
  const { data, error } = await supabase.from('result_positions').insert(rows).select();
  if (error) { console.error('[API] addResultPositions error', error); throw error; }
  return data;
}

export async function fetchResultsBySport(sportId: string) {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase.from('results').select('id,event,category,gender,event_date,event_time').eq('sport_id', sportId).order('event_date', { ascending: false });
  if (error) { console.error('[API] fetchResultsBySport error', error); throw error; }
  return (data || []) as { id: number; event: string | null; category: string; gender: string; event_date: string; event_time: string }[];
}

export async function fetchResultPositions(resultId: number) {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase.from('result_positions').select('place,faculty_id,faculties(name)').eq('result_id', resultId).order('place', { ascending: true });
  if (error) { console.error('[API] fetchResultPositions error', error); throw error; }
  return (data || []) as { place: number; faculty_id: string; faculties?: { name: string } | { name: string }[] | null }[];
}

// -----------------------
// Points allocation helpers
// -----------------------
function scoreForPlace(place: number) {
  if (place === 1) return 7;
  if (place === 2) return 5;
  if (place === 3) return 3;
  if (place === 4) return 2;
  return 1; // 5th and beyond
}

// Apply points for an overall result (adds to faculty_points mens_points/womens_points)
export async function applyPointsForResult(resultId: number) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');

  // fetch result and positions
  const rRes = await supabase.from('results').select('id,event,gender').eq('id', resultId).single();
  if (rRes.error) { console.error('[API] applyPointsForResult result fetch error', rRes.error); throw rRes.error; }
  const result = rRes.data as { id: number; event: string | null; gender: string | null } | null;
  if (!result) throw new Error('Result not found');

  // Only apply for 'overall' style events. Heuristic: event name includes 'overall' (case-insensitive) OR event is null/empty.
  const name = (result.event || '').toLowerCase();
  const isOverall = name.includes('overall') || name.trim() === '';
  if (!isOverall) {
    // nothing to do for non-overall events
    return null;
  }

  const pos = await fetchResultPositions(resultId);
  if (!pos || pos.length === 0) return null;

  // accumulate deltas per faculty
  const deltas = new Map<string, number>();
  pos.forEach((p) => {
    const pts = scoreForPlace(p.place);
    deltas.set(p.faculty_id, (deltas.get(p.faculty_id) || 0) + pts);
  });

  // fetch existing faculty_points for these faculties
  const facIds = Array.from(deltas.keys());
  const { data: existingRows } = await supabase.from('faculty_points').select('faculty_id,mens_points,womens_points').in('faculty_id', facIds as string[]);

  const existingMap = new Map<string, { mens_points: number | null; womens_points: number | null }>();
  (existingRows || []).forEach((r: any) => existingMap.set(r.faculty_id, { mens_points: r.mens_points ?? 0, womens_points: r.womens_points ?? 0 }));

  // apply updates/inserts
  for (const [faculty_id, delta] of deltas.entries()) {
    const current = existingMap.get(faculty_id);
    // decide which column to update based on gender
    const g = result.gender ?? '';
    const isMens = /men/i.test(g);
    const isWomens = /women/i.test(g);

    if (current) {
      const newMens = (current.mens_points ?? 0) + (isMens ? delta : 0) + (!isMens && !isWomens && delta ? delta : 0);
      const newWomens = (current.womens_points ?? 0) + (isWomens ? delta : 0);
      const { error } = await supabase.from('faculty_points').update({ mens_points: newMens, womens_points: newWomens, updated_at: new Date().toISOString() }).eq('faculty_id', faculty_id);
      if (error) console.error('[API] applyPointsForResult update error', error);
    } else {
      const mens = isMens ? delta : (!isMens && !isWomens ? delta : 0);
      const womens = isWomens ? delta : 0;
      const { error } = await supabase.from('faculty_points').insert([{ faculty_id, mens_points: mens, womens_points: womens, updated_at: new Date().toISOString() }]);
      if (error) console.error('[API] applyPointsForResult insert error', error);
    }
  }

  return true;
}

// Remove points previously applied for a result (reverse the allocation). This is used before deleting a result.
export async function removePointsForResult(resultId: number) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const rRes = await supabase.from('results').select('id,event,gender').eq('id', resultId).single();
  if (rRes.error) { console.error('[API] removePointsForResult result fetch error', rRes.error); throw rRes.error; }
  const result = rRes.data as { id: number; event: string | null; gender: string | null } | null;
  if (!result) return null;
  const name = (result.event || '').toLowerCase();
  const isOverall = name.includes('overall') || name.trim() === '';
  if (!isOverall) return null;

  const pos = await fetchResultPositions(resultId);
  if (!pos || pos.length === 0) return null;

  const deltas = new Map<string, number>();
  pos.forEach((p) => {
    const pts = scoreForPlace(p.place);
    deltas.set(p.faculty_id, (deltas.get(p.faculty_id) || 0) + pts);
  });

  const facIds = Array.from(deltas.keys());
  const { data: existingRows } = await supabase.from('faculty_points').select('faculty_id,mens_points,womens_points').in('faculty_id', facIds as string[]);
  const existingMap = new Map<string, { mens_points: number | null; womens_points: number | null }>();
  (existingRows || []).forEach((r: any) => existingMap.set(r.faculty_id, { mens_points: r.mens_points ?? 0, womens_points: r.womens_points ?? 0 }));

  for (const [faculty_id, delta] of deltas.entries()) {
    const current = existingMap.get(faculty_id) ?? { mens_points: 0, womens_points: 0 };
    const g = result.gender ?? '';
    const isMens = /men/i.test(g);
    const isWomens = /women/i.test(g);
    const newMens = Math.max(0, (current.mens_points ?? 0) - (isMens ? delta : (!isMens && !isWomens ? delta : 0)));
    const newWomens = Math.max(0, (current.womens_points ?? 0) - (isWomens ? delta : 0));
    const { error } = await supabase.from('faculty_points').update({ mens_points: newMens, womens_points: newWomens, updated_at: new Date().toISOString() }).eq('faculty_id', faculty_id);
    if (error) console.error('[API] removePointsForResult update error', error);
  }

  return true;
}

// Delete a result and its positions; remove points allocation if it was an overall result
export async function deleteResult(resultId: number) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  // reverse points first
  try {
    await removePointsForResult(resultId);
  } catch (err) {
    console.error('[API] deleteResult: removePoints failed', err);
  }

  // delete positions then result
  const { error: posErr } = await supabase.from('result_positions').delete().eq('result_id', resultId);
  if (posErr) { console.error('[API] deleteResult positions error', posErr); throw posErr; }
  const { data, error } = await supabase.from('results').delete().eq('id', resultId).select();
  if (error) { console.error('[API] deleteResult error', error); throw error; }
  return data;
}
