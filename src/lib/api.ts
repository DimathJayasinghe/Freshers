// Rewritten clean file with robust gender parsing and corrected logic
import { supabase, hasSupabaseEnv } from './supabaseClient';
import { getSiteUrl } from './utils';
import type { TeamData } from '@/data/leaderboardData';
import type { LiveMatch, ScheduleMatch } from '@/data/homeData';
import type { Sport } from '@/data/sportsData';
import type { CompletedEvent } from '@/data/resultsData';

// --------------------------------------------------
// Generic helpers
// --------------------------------------------------
function formatTimeFromISO(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
}

// Central gender parsing (avoids /men/i matching inside "Women")
function parseGenderFlags(genderRaw: string | null | undefined): { isMens: boolean; isWomens: boolean } {
  const g = (genderRaw || '').trim().toLowerCase();
  if (!g) return { isMens: false, isWomens: false };
  const womensTokens = new Set(['women', "women's", 'womens', 'female']);
  const mensTokens = new Set(['men', "men's", 'mens', 'male']);
  const isWomens = womensTokens.has(g);
  const isMens = !isWomens && mensTokens.has(g);
  return { isMens, isWomens };
}

// --------------------------------------------------
// Sports CRUD
// --------------------------------------------------
export async function fetchSports(): Promise<Sport[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase.from('sports').select('id,name,category,gender').order('name');
  if (error) throw error;
  return (data || []) as Sport[];
}

export async function createSport(payload: { id: string; name: string; category: Sport['category']; gender?: 'Mens' | 'Womens' | 'Both' }) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('sports').insert([{ id: payload.id, name: payload.name, category: payload.category, gender: payload.gender ?? 'Both' }]);
  if (error) throw error;
  return data;
}

export async function updateSport(id: string, payload: { name?: string; category?: Sport['category']; gender?: 'Mens' | 'Womens' | 'Both' }) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('sports').update(payload).eq('id', id).select();
  if (error) throw error;
  return data;
}

export async function deleteSport(id: string) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('sports').delete().eq('id', id).select();
  if (error) throw error;
  return data;
}

// --------------------------------------------------
// Dangerous cascading deletion helpers (admin only)
// --------------------------------------------------
export async function deleteScheduledEventsBySport(sportId: string) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('scheduled_events').delete().eq('sport_id', sportId);
  if (error) throw error;
}

export async function fetchLiveSeriesIdsBySport(sportId: string): Promise<number[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase.from('live_sport_series').select('id').eq('sport_id', sportId);
  if (error) throw error;
  return (data || []).map((r: any) => r.id as number);
}

export async function fetchResultIdsBySport(sportId: string): Promise<number[]> {
  const rows = await fetchResultsBySport(sportId);
  return rows.map(r => r.id as number);
}

export async function deleteAllResultsBySport(sportId: string) {
  const ids = await fetchResultIdsBySport(sportId);
  for (const id of ids) await deleteResult(id);
}

export async function deleteFacultySportsBySport(sportId: string) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('faculty_sports').delete().eq('sport_id', sportId);
  if (error) throw error;
}

export async function deleteFacultyAchievementsBySport(sportId: string) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('faculty_achievements').delete().eq('sport_id', sportId);
  if (error) throw error;
}

export async function deleteSportWithCascade(sportId: string) {
  try { await deleteScheduledEventsBySport(sportId); } catch (e) { console.warn('schedule delete warn', e); }
  try {
    const sIds = await fetchLiveSeriesIdsBySport(sportId);
    for (const sid of sIds) { try { await deleteLiveSeries(sid); } catch (e) { console.warn('live series delete warn', sid, e); } }
  } catch (e) { console.warn('fetch live series warn', e); }
  try { await deleteAllResultsBySport(sportId); } catch (e) { console.warn('results delete warn', e); }
  try { await deleteFacultySportsBySport(sportId); } catch (e) { console.warn('faculty_sports delete warn', e); }
  try { await deleteFacultyAchievementsBySport(sportId); } catch (e) { console.warn('faculty_achievements delete warn', e); }
  return deleteSport(sportId);
}

// --------------------------------------------------
// Faculties overview/detail
// --------------------------------------------------
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
  championSports: string[]; // sports where this faculty has recorded a championship
};

type FacultyRow = { id: string; name: string; short_name: string; primary_color: string; secondary_color: string; logo_url: string };
type FacultySportsRow = { faculty_id: string };
type FacultyAchievementRow = { faculty_id: string; position: string; year: number | null; sports?: { name: string } | { name: string }[] | null };

export async function fetchFacultiesOverview(): Promise<FacultyOverview[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const [facRes, lbRes, fsRes, achRes] = await Promise.all([
    supabase.from('faculties').select('id,name,short_name,primary_color,secondary_color,logo_url'),
    supabase.from('leaderboard').select('name,rank,total_points'),
    supabase.from('faculty_sports').select('faculty_id'),
    supabase.from('faculty_achievements').select('faculty_id, position, year, sports(name)').order('year', { ascending: false })
  ]);
  if (facRes.error) throw facRes.error;
  if (lbRes.error) throw lbRes.error;
  if (fsRes.error) throw fsRes.error;
  if (achRes.error) throw achRes.error;

  const faculties = (facRes.data || []) as FacultyRow[];
  const leaderboard = (lbRes.data || []) as { name: string; rank: number; total_points: number }[];
  const sportsCounts = new Map<string, number>();
  (fsRes.data || [] as FacultySportsRow[]).forEach(r => sportsCounts.set(r.faculty_id, (sportsCounts.get(r.faculty_id) || 0) + 1));
  const latestByFaculty = new Map<string, { sport: string | null; position: string; year: number | null }>();
  const championByFaculty = new Map<string, Set<string>>();
  (achRes.data || [] as FacultyAchievementRow[]).forEach(r => {
    const sportName = Array.isArray(r.sports) ? (r.sports as { name: string }[])[0]?.name ?? null : (r.sports as { name: string } | null | undefined)?.name ?? null;
    if (!latestByFaculty.has(r.faculty_id)) latestByFaculty.set(r.faculty_id, { sport: sportName, position: r.position, year: r.year });
    // Detect championships
  const isChampion = /(champ|1st|first|gold|winner)/i.test(r.position || '');
    if (isChampion && sportName) {
      if (!championByFaculty.has(r.faculty_id)) championByFaculty.set(r.faculty_id, new Set());
      championByFaculty.get(r.faculty_id)!.add(sportName);
    }
  });
  return faculties.map(f => {
    const lb = leaderboard.find(l => l.name === f.name);
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
      championSports: Array.from(championByFaculty.get(f.id) || [])
    } satisfies FacultyOverview;
  });
}

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
  const [fRes, pRes, fsRes, achRes, tmRes, posRes] = await Promise.all([
    supabase.from('faculties').select('id,name,short_name,primary_color,secondary_color,logo_url').eq('id', facultyId).single(),
    supabase.from('faculty_points').select('mens_points,womens_points,total_points').eq('faculty_id', facultyId).single(),
    supabase.from('faculty_sports').select('sports(name)').eq('faculty_id', facultyId),
    supabase.from('faculty_achievements').select('position,year,sports(name)').eq('faculty_id', facultyId).order('year', { ascending: false }),
    supabase.from('faculty_team_members').select('name,role,sports(name)').eq('faculty_id', facultyId),
    supabase.from('result_positions').select('place,results(event_date,sports(name))').eq('faculty_id', facultyId)
  ]);
  if (fRes.error) throw fRes.error;
  const f = fRes.data; if (!f) return null;
  if (pRes.error && pRes.error.code !== 'PGRST116') throw pRes.error;
  if (fsRes.error) throw fsRes.error;
  if (achRes.error) throw achRes.error;
  if (tmRes.error) throw tmRes.error;
  if (posRes.error) throw posRes.error;

  const sports = ((fsRes.data || []) as { sports?: { name: string } | { name: string }[] | null }[])
    .map(r => (Array.isArray(r.sports) ? (r.sports as { name: string }[])[0]?.name : (r.sports as { name: string } | null | undefined)?.name))
    .filter(Boolean) as string[];

  const placements = ((posRes.data || []) as { place: number; results?: { event_date: string; sports?: { name: string } | { name: string }[] | null } | { event_date: string; sports?: { name: string } | { name: string }[] | null }[] | null }[])
    .map(r => {
      const res = Array.isArray(r.results) ? r.results[0] : r.results as any;
      const sportName = res ? (Array.isArray(res.sports) ? res.sports[0]?.name : (res.sports as { name: string } | null | undefined)?.name) : null;
      const year = res?.event_date ? new Date(res.event_date).getFullYear() : null;
      return { sport: sportName as string | null, place: r.place, year: year as number | null };
    })
    .filter(p => p.sport && p.place) as { sport: string; place: number; year: number | null }[];
  const latestYearBySportPlace = new Map<string, number>();
  placements.forEach(p => { const key = `${p.sport}|${p.place}`; const prev = latestYearBySportPlace.get(key) ?? 0; const y = p.year ?? 0; if (y > prev) latestYearBySportPlace.set(key, y); });

  const labelToPlace = (txt: string): number | null => {
    const p = txt.toLowerCase();
    if (/second\s*runner/.test(p)) return 3;
    if (/third\s*runner/.test(p)) return 4;
    if (/(^|\b)(1st|champ|champion|gold|winner)(\b|$)/.test(p)) return 1;
    if (/(^|\b)(2nd|runner-up|runner up|runner|silver)(\b|$)/.test(p)) return 2;
    if (/(^|\b)(3rd|third|bronze)(\b|$)/.test(p)) return 3;
    if (/(^|\b)(4th|fourth)(\b|$)/.test(p)) return 4;
    return null;
  };

  const dbAchievements = ((achRes.data || []) as { position: string; year: number | null; sports?: { name: string } | { name: string }[] | null }[])
    .map(r => {
      const sportName = Array.isArray(r.sports) ? r.sports[0]?.name : (r.sports as { name: string } | null | undefined)?.name;
      const place = labelToPlace(r.position);
      let year: number | null = r.year ?? null;
      if (sportName && place) { const key = `${sportName}|${place}`; const resYear = latestYearBySportPlace.get(key); if (resYear) year = resYear; }
      return { sport: sportName ?? null, position: r.position, year };
    });

  const placeToLabel = (place: number): string => {
    switch (place) { case 1: return 'Champion'; case 2: return 'Runner-up'; case 3: return 'Third place'; case 4: return 'Fourth place'; default: return `${place}`; }
  };
  const resAchievements = placements.map(p => ({ sport: p.sport, position: placeToLabel(p.place), year: p.year })) as { sport: string | null; position: string; year: number | null }[];
  const mergedMap = new Map<string, { sport: string | null; position: string; year: number | null }>();
  [...dbAchievements, ...resAchievements].forEach(a => { const key = `${a.sport ?? ''}|${a.position.toLowerCase()}|${a.year ?? ''}`; if (!mergedMap.has(key)) mergedMap.set(key, a); });
  const achievements = Array.from(mergedMap.values());
  const team = ((tmRes.data || []) as { name: string; role: string; sports?: { name: string } | { name: string }[] | null }[])
    .map(r => ({ name: r.name, role: r.role, sport: (Array.isArray(r.sports) ? r.sports[0]?.name : (r.sports as { name: string } | null | undefined)?.name) ?? null }));

  return {
    id: f.id,
    name: f.name,
    shortName: f.short_name,
    colors: { primary: f.primary_color, secondary: f.secondary_color },
    logo: f.logo_url,
    points: { mens: pRes.data?.mens_points ?? 0, womens: pRes.data?.womens_points ?? 0, total: pRes.data?.total_points ?? 0 },
    sports,
    achievements,
    team
  } satisfies FacultyDetailData;
}

// Create faculty (logo upload optional)
export async function createFaculty(payload: { id: string; name: string; short_name: string; primary_color: string; secondary_color: string; logoFile?: File | null; logoUrl?: string | null }) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  let logo_url = payload.logoUrl ?? null;
  if (payload.logoFile) {
    const path = `faculties/${payload.id}-${Date.now()}-${payload.logoFile.name}`;
    const uploadRes = await supabase.storage.from('logos').upload(path, payload.logoFile, { upsert: true });
    if (uploadRes.error) throw uploadRes.error;
    const publicRes = supabase.storage.from('logos').getPublicUrl(path);
    logo_url = publicRes?.data?.publicUrl ?? `/${path}`;
  }
  const insert = { id: payload.id, name: payload.name, short_name: payload.short_name, primary_color: payload.primary_color, secondary_color: payload.secondary_color, logo_url: logo_url ?? '' };
  const { data, error } = await supabase.from('faculties').insert([insert]).select();
  if (error) throw error;
  return data;
}

export async function deleteFaculty(id: string) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('faculties').delete().eq('id', id).select();
  if (error) throw error;
  return data;
}

// --------------------------------------------------
// Schedule (Lineup)
// --------------------------------------------------
export type ScheduleDay = { date: string; events: { sport: string; time: string; venue: string }[] };
export async function fetchScheduleCalendar(): Promise<ScheduleDay[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase.from('scheduled_events').select('event_date,sport_label,start_time,time_range,venue,sports(name)').order('event_date').order('start_time', { ascending: true, nullsFirst: false });
  if (error) throw error;
  const byDate = new Map<string, { sport: string; time: string; venue: string }[]>();
  (data || [] as any[]).forEach(r => {
    const date = r.event_date as string;
    const time = r.time_range ?? (r.start_time ? formatTimeFromISO(`1970-01-01T${r.start_time}Z`) : '');
    const sportObj = Array.isArray(r.sports) ? (r.sports as any[])[0] : (r.sports as any | undefined);
    const sport = r.sport_label ?? (sportObj ? (sportObj as any).name : undefined) ?? 'Event';
    const entry = { sport, time, venue: r.venue as string };
    byDate.set(date, [...(byDate.get(date) || []), entry]);
  });
  return Array.from(byDate.entries()).map(([date, events]) => ({ date: new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), events }));
}

// --------------------------------------------------
// Results public view
// --------------------------------------------------
export async function fetchResults(): Promise<CompletedEvent[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase.from('results_view').select('id,sport,event,category,gender,date,time,positions');
  if (error) throw error;
  const rows = (data || []) as { id: number; sport: string; event: string | null; category: CompletedEvent['category']; gender: CompletedEvent['gender']; date: string; time: string; positions: { place: number; faculty: string }[] }[];
  return rows.map(r => ({ id: r.id, sport: r.sport, event: r.event ?? undefined, category: r.category, gender: r.gender, date: r.date, time: r.time, positions: Array.isArray(r.positions) ? r.positions : [] }));
}

// --------------------------------------------------
// Leaderboard
// --------------------------------------------------
type LeaderboardRow = { rank: number; name: string; code: string; mens_points: number | null; womens_points: number | null; total_points: number | null };
export async function fetchLeaderboard(): Promise<TeamData[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase.from('leaderboard').select('rank,name,code,mens_points,womens_points,total_points').order('rank');
  if (error) throw error;
  return (data as LeaderboardRow[] | null || []).map(row => ({ rank: row.rank, name: row.name, code: row.code, mensPoints: row.mens_points ?? 0, womensPoints: row.womens_points ?? 0, totalPoints: row.total_points ?? 0 }));
}

// --------------------------------------------------
// Live matches (legacy simple)
// --------------------------------------------------
type LiveMatchRow = { id: number; sport: string; venue: string; team1: string; team2: string; status: string; status_color: string | null };
export async function fetchLiveMatches(): Promise<LiveMatch[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase.from('live_matches').select('id,sport,venue,team1,team2,status,status_color').order('id');
  if (error) throw error;
  return (data as LiveMatchRow[] | null || []).map(row => ({ id: row.id, sport: row.sport, venue: row.venue, team1: row.team1, team2: row.team2, status: row.status, statusColor: row.status_color ?? 'text-green-400' }));
}

// --------------------------------------------------
// Live fixtures (new schema)
// --------------------------------------------------
export type LiveFixture = { id: number; sport_id: string; sport_name: string; venue: string; team1: string; team2: string; team1_score: string | null; team2_score: string | null; status: string; status_text: string | null };
export async function fetchOngoingSports(): Promise<{ id: string; name: string }[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase.from('fixtures').select('sport_id,sports(name)').eq('status', 'live');
  if (error) throw error;
  const seen = new Map<string, string>();
  (data as any[] | null || []).forEach(row => { const sid = row.sport_id as string; const sObj = Array.isArray(row.sports) ? row.sports[0] : row.sports; const name = sObj?.name as string | undefined; if (sid && name && !seen.has(sid)) seen.set(sid, name); });
  return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
}
export async function fetchLiveFixturesBySport(sportId: string): Promise<LiveFixture[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase
    .from('fixtures')
    .select('id,sport_id,venue,status,status_text,team1_score,team2_score,sports(name),team1:faculties!fixtures_team1_faculty_id_fkey(name),team2:faculties!fixtures_team2_faculty_id_fkey(name)')
    .eq('sport_id', sportId)
    .eq('status', 'live')
    .order('id');
  if (error) throw error;
  const rows = (data || []) as any[];
  return rows.map(r => {
    const sportObj = Array.isArray(r.sports) ? r.sports[0] : r.sports;
    const t1 = (Array.isArray(r.team1) ? r.team1[0] : r.team1) || { name: '' };
    const t2 = (Array.isArray(r.team2) ? r.team2[0] : r.team2) || { name: '' };
    return { id: r.id, sport_id: r.sport_id, sport_name: sportObj?.name, venue: r.venue, team1: t1?.name, team2: t2?.name, team1_score: r.team1_score ?? null, team2_score: r.team2_score ?? null, status: r.status, status_text: r.status_text ?? null } as LiveFixture;
  });
}
export async function updateFixture(id: number, payload: Partial<{ team1_score: string | null; team2_score: string | null; status: string; status_text: string | null; winner_faculty_id: string | null }>) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('fixtures').update(payload).eq('id', id).select();
  if (error) throw error;
  return data;
}

// --------------------------------------------------
// Live series + matches
// --------------------------------------------------
export async function fetchLiveSportsNow(): Promise<{ id: string; name: string }[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase.from('live_sports_now').select('sport_id,sport_name');
  if (error) throw error;
  return (data || []).map((r: any) => ({ id: r.sport_id as string, name: r.sport_name as string })).filter(r => r.id && r.name);
}
export type LiveSeriesMatchView = { id: number; series_id: number; sport_id: string; sport_name: string; gender?: 'male' | 'female' | 'mixed'; match_order: number; venue: string | null; stage: string | null; status: string; status_text: string | null; team1: string; team2: string; team1_score: string | null; team2_score: string | null; is_finished: boolean; winner_name: string | null; commentary?: string | null };
export async function fetchLiveSeriesMatchesBySport(sportId: string): Promise<LiveSeriesMatchView[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase.from('live_series_matches_view').select('id,series_id,sport_id,sport_name,gender,match_order,venue,stage,status,status_text,team1,team2,team1_score,team2_score,is_finished,winner_name,commentary').eq('sport_id', sportId).order('match_order').order('id');
  if (error) throw error;
  return (data || []) as LiveSeriesMatchView[];
}
export async function fetchActiveSeriesIdsBySport(sportId: string): Promise<number[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase.from('live_sport_series').select('id').eq('sport_id', sportId).eq('is_finished', false);
  if (error) throw error;
  return (data || []).map((r: any) => r.id as number);
}
export async function deleteLiveSeries(series_id: number) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('live_sport_series').delete().eq('id', series_id);
  if (error) throw error;
  return true;
}

type ScheduledEventRow = { id: number; event_date: string; sport_label: string | null; time_range: string | null; start_time: string | null; end_time: string | null; venue: string; sports?: { name: string } | { name: string }[] | null };
export async function fetchTodaySchedule(): Promise<ScheduleMatch[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const today = new Date(); today.setHours(0,0,0,0);
  const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const { data, error } = await supabase.from('scheduled_events').select('id,event_date,sport_label,time_range,start_time,end_time,venue,sports(name)').eq('event_date', dateStr).order('start_time', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data as ScheduledEventRow[] | null || []).map(row => {
    const sportObj = Array.isArray(row.sports) ? row.sports[0] : row.sports;
    return { id: row.id, time: row.time_range ?? (row.start_time ? formatTimeFromISO(`1970-01-01T${row.start_time}Z`) : ''), sport: row.sport_label ?? sportObj?.name ?? 'Event', match: row.sport_label ?? 'Match', team1: '', team2: '', venue: row.venue } as ScheduleMatch;
  });
}
export type ScheduledEventRowFull = { id: number; event_date: string; sport_id: string | null; sport_label: string | null; time_range: string | null; start_time: string | null; end_time: string | null; venue: string; created_at: string };
export async function fetchScheduledEvents(): Promise<ScheduledEventRowFull[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase.from('scheduled_events').select('id,event_date,sport_id,sport_label,time_range,start_time,end_time,venue,created_at').order('event_date').order('start_time', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data || []) as ScheduledEventRowFull[];
}
export async function createScheduledEvent(payload: { event_date: string; sport_id?: string | null; sport_label?: string | null; time_range?: string | null; start_time?: string | null; end_time?: string | null; venue: string }) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('scheduled_events').insert([payload]).select();
  if (error) throw error;
  return data;
}
export async function updateScheduledEvent(id: number, payload: Partial<{ event_date: string; sport_id: string | null; sport_label: string | null; time_range: string | null; start_time: string | null; end_time: string | null; venue: string }>) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('scheduled_events').update(payload).eq('id', id).select();
  if (error) throw error;
  return data;
}
export async function deleteScheduledEvent(id: number) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('scheduled_events').delete().eq('id', id).select();
  if (error) throw error;
  return data;
}

// --------------------------------------------------
// Faculties list simple
// --------------------------------------------------
export async function fetchFacultiesList(): Promise<{ id: string; name: string; short_name: string }[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase.from('faculties').select('id,name,short_name').order('name');
  if (error) throw error;
  return (data || []) as { id: string; name: string; short_name: string }[];
}

// --------------------------------------------------
// Results CRUD (admin)
// --------------------------------------------------
export async function createResult(payload: { sport_id: string; event?: string | null; category: 'Team Sport' | 'Individual Sport' | 'Athletics' | 'Swimming'; gender: "Men's" | "Women's" | 'Mixed'; event_date: string; event_time: string }) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('results').insert([payload]).select();
  if (error) throw error;
  return data?.[0] as { id: number } | null;
}
export async function addResultPositions(resultId: number, positions: Array<{ place: number; faculty_id: string }>) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const normalized = normalizePositionsForStorage(positions);
  const rows = normalized.map(p => ({ result_id: resultId, place: p.place, faculty_id: p.faculty_id }));
  const { data, error } = await supabase.from('result_positions').insert(rows).select();
  if (error) throw error;
  return data;
}
export async function fetchResultsBySport(sportId: string) {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase.from('results').select('id,event,category,gender,event_date,event_time').eq('sport_id', sportId).order('event_date', { ascending: false });
  if (error) throw error;
  return (data || []) as { id: number; event: string | null; category: string; gender: string; event_date: string; event_time: string }[];
}
export async function fetchResultPositions(resultId: number) {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase.from('result_positions').select('place,faculty_id,faculties(name)').eq('result_id', resultId).order('place');
  if (error) throw error;
  return (data || []) as { place: number; faculty_id: string; faculties?: { name: string } | { name: string }[] | null }[];
}

// Points helpers
function scoreForPlace(place: number, custom?: Record<number, number>) {
  if (custom && Number.isFinite(custom[place])) return Number(custom[place]);
  if (place === 1) return 7; if (place === 2) return 5; if (place === 3) return 3; if (place === 4) return 2; return 1;
}

// Compute deltas with tie handling and competition ranking (1,1,3)
// - positions: array of { place, faculty_id }
// - custom: optional map overriding base points per rank
// Rules:
//   1) If multiple faculties share a rank r, split that rank's points equally among them
//   2) Skip the next position(s) by the size of the tie (competition ranking)
function computeTieAwareDeltas(positions: Array<{ place: number; faculty_id: string }>, custom?: Record<number, number>): Map<string, number> {
  const byPlace = new Map<number, string[]>();
  for (const p of positions) {
    if (!p.faculty_id || !Number.isFinite(p.place)) continue;
    byPlace.set(p.place, [...(byPlace.get(p.place) || []), p.faculty_id]);
  }
  const groups = Array.from(byPlace.entries()).sort((a,b)=>a[0]-b[0]).map(([_, ids])=>ids);
  const deltas = new Map<string, number>();
  let rank = 1; // effective rank according to competition ranking
  for (const ids of groups) {
    const base = scoreForPlace(rank, custom);
    const share = base / Math.max(1, ids.length);
    ids.forEach(fid => deltas.set(fid, (deltas.get(fid) || 0) + share));
    rank += ids.length; // skip ranks according to tie size
  }
  return deltas;
}

// Normalize an incoming positions list so stored places follow competition ranking (1,1,3)
function normalizePositionsForStorage(rows: Array<{ place: number; faculty_id: string }>): Array<{ place: number; faculty_id: string }>{
  const byPlace = new Map<number, { place: number; faculty_id: string }[]>();
  for (const r of rows) {
    if (!r.faculty_id || !Number.isFinite(r.place)) continue;
    byPlace.set(r.place, [...(byPlace.get(r.place) || []), { place: r.place, faculty_id: r.faculty_id }]);
  }
  const placesSorted = Array.from(byPlace.keys()).sort((a,b)=>a-b);
  const result: Array<{ place: number; faculty_id: string }> = [];
  let nextPlace = 1;
  for (const nominal of placesSorted) {
    const group = byPlace.get(nominal)!;
    for (const r of group) result.push({ place: nextPlace, faculty_id: r.faculty_id });
    nextPlace += group.length; // competition ranking skip
  }
  return result;
}
export async function applyPointsForResult(resultId: number, customPoints?: Record<number, number>, mode: 'overall-only' | 'always' = 'overall-only') {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const rRes = await supabase.from('results').select('id,event,gender').eq('id', resultId).single();
  if (rRes.error) throw rRes.error;
  const result = rRes.data as { id: number; event: string | null; gender: string | null } | null; if (!result) throw new Error('Result not found');
  const name = (result.event || '').toLowerCase(); const isOverall = name.includes('overall') || name.trim() === '';
  if (mode === 'overall-only' && !isOverall) return null;
  const pos = await fetchResultPositions(resultId); if (!pos.length) return null;
  const deltas = computeTieAwareDeltas(pos as any, customPoints);
  const facIds = Array.from(deltas.keys()); const { data: existingRows } = await supabase.from('faculty_points').select('faculty_id,mens_points,womens_points').in('faculty_id', facIds);
  const existingMap = new Map<string, { mens_points: number; womens_points: number }>(); (existingRows || []).forEach((r: any) => existingMap.set(r.faculty_id, { mens_points: Number(r.mens_points ?? 0), womens_points: Number(r.womens_points ?? 0) }));
  const { isMens, isWomens } = parseGenderFlags(result.gender);
  for (const [faculty_id, delta] of deltas.entries()) {
    const current = existingMap.get(faculty_id);
    if (current) {
  const newMens = (current.mens_points ?? 0) + (isMens ? delta : 0) + (!isMens && !isWomens ? delta : 0);
  const newWomens = (current.womens_points ?? 0) + (isWomens ? delta : 0);
      await supabase.from('faculty_points').update({ mens_points: newMens, womens_points: newWomens, updated_at: new Date().toISOString() }).eq('faculty_id', faculty_id);
    } else {
      const mens = isMens ? delta : (!isMens && !isWomens ? delta : 0);
      const womens = isWomens ? delta : 0;
      await supabase.from('faculty_points').insert([{ faculty_id, mens_points: mens, womens_points: womens, updated_at: new Date().toISOString() }]);
    }
  }
  return true;
}
export async function removePointsForResult(resultId: number, customPoints?: Record<number, number>, mode: 'overall-only' | 'always' = 'overall-only') {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const rRes = await supabase.from('results').select('id,event,gender').eq('id', resultId).single();
  if (rRes.error) throw rRes.error; const result = rRes.data as { id: number; event: string | null; gender: string | null } | null; if (!result) return null;
  const name = (result.event || '').toLowerCase(); const isOverall = name.includes('overall') || name.trim() === '';
  if (mode === 'overall-only' && !isOverall) return null;
  const pos = await fetchResultPositions(resultId); if (!pos.length) return null;
  const deltas = computeTieAwareDeltas(pos as any, customPoints);
  const facIds = Array.from(deltas.keys()); const { data: existingRows } = await supabase.from('faculty_points').select('faculty_id,mens_points,womens_points').in('faculty_id', facIds);
  const existingMap = new Map<string, { mens_points: number; womens_points: number }>(); (existingRows || []).forEach((r: any) => existingMap.set(r.faculty_id, { mens_points: Number(r.mens_points ?? 0), womens_points: Number(r.womens_points ?? 0) }));
  const { isMens, isWomens } = parseGenderFlags(result.gender);
  for (const [faculty_id, delta] of deltas.entries()) {
    const current = existingMap.get(faculty_id) ?? { mens_points: 0, womens_points: 0 };
    const mensSub = isMens ? delta : (!isMens && !isWomens ? delta : 0);
  const newMens = Math.max(0, (current.mens_points ?? 0) - mensSub);
  const newWomens = Math.max(0, (current.womens_points ?? 0) - (isWomens ? delta : 0));
    await supabase.from('faculty_points').update({ mens_points: newMens, womens_points: newWomens, updated_at: new Date().toISOString() }).eq('faculty_id', faculty_id);
  }
  return true;
}
export async function deleteResult(resultId: number) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  try { await removePointsForResult(resultId); } catch (e) { console.warn('remove points warn', e); }
  const { error: posErr } = await supabase.from('result_positions').delete().eq('result_id', resultId); if (posErr) throw posErr;
  const { data, error } = await supabase.from('results').delete().eq('id', resultId).select(); if (error) throw error; return data;
}
export async function updateResultRow(resultId: number, payload: Partial<{ event: string | null; category: 'Team Sport' | 'Individual Sport' | 'Athletics' | 'Swimming'; gender: "Men's" | "Women's" | 'Mixed'; event_date: string; event_time: string }>) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const patch: any = { ...payload }; if (patch.event === '') patch.event = null;
  const { data, error } = await supabase.from('results').update(patch).eq('id', resultId).select('id,event,category,gender,event_date,event_time').single(); if (error) throw error; return data as any;
}
export async function replaceResultPositionsAndReapply(resultId: number, positions: Array<{ place: number; faculty_id: string }>, customPoints?: Record<number, number>, participants?: Array<{ faculty_id: string; points?: number }>, applyMode: 'overall-only' | 'always' = 'overall-only') {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  try { await removePointsForResult(resultId, customPoints, applyMode); } catch (e) { console.warn('remove points warn', e); }
  const { error: delErr } = await supabase.from('result_positions').delete().eq('result_id', resultId); if (delErr) throw delErr;
  const normalized = normalizePositionsForStorage(positions.filter(p => p.faculty_id && p.place > 0));
  const rows = normalized.map(p => ({ result_id: resultId, place: p.place, faculty_id: p.faculty_id }));
  if (rows.length) { const { error: insErr } = await supabase.from('result_positions').insert(rows); if (insErr) throw insErr; }
  try { await applyPointsForResult(resultId, customPoints, applyMode); } catch (e) { console.warn('apply points warn', e); }
  try {
    const part = (participants || []).filter(p => p.faculty_id);
    const placedIds = new Set<string>(normalized.map(p => p.faculty_id));
    const filtered = part.filter(p => !placedIds.has(p.faculty_id));
    if (filtered.length) {
      const rRes = await supabase.from('results').select('gender').eq('id', resultId).single();
      const { isMens, isWomens } = parseGenderFlags(rRes.data?.gender as string | null);
      const deltas = new Map<string, number>();
      filtered.forEach(p => deltas.set(p.faculty_id, (deltas.get(p.faculty_id) || 0) + (Number.isFinite(p.points as number) ? Number(p.points) : 1)));
      const facIds = Array.from(deltas.keys());
    const { data: existingRows } = await supabase.from('faculty_points').select('faculty_id,mens_points,womens_points').in('faculty_id', facIds);
  const existingMap = new Map<string, { mens_points: number; womens_points: number }>(); (existingRows || []).forEach((r: any) => existingMap.set(r.faculty_id, { mens_points: Number(r.mens_points ?? 0), womens_points: Number(r.womens_points ?? 0) }));
      for (const [faculty_id, delta] of deltas.entries()) {
        const current = existingMap.get(faculty_id);
        if (current) {
            const newMens = (current.mens_points ?? 0) + (isMens ? delta : 0) + (!isMens && !isWomens ? delta : 0);
            const newWomens = (current.womens_points ?? 0) + (isWomens ? delta : 0);
          await supabase.from('faculty_points').update({ mens_points: newMens, womens_points: newWomens, updated_at: new Date().toISOString() }).eq('faculty_id', faculty_id);
        } else {
          const mens = isMens ? delta : (!isMens && !isWomens ? delta : 0);
          const womens = isWomens ? delta : 0;
          await supabase.from('faculty_points').insert([{ faculty_id, mens_points: mens, womens_points: womens, updated_at: new Date().toISOString() }]);
        }
      }
    }
  } catch (e) { console.warn('participant points warn', e); }
  return true;
}

// --------------------------------------------------
// Admin auth helpers
// --------------------------------------------------
export async function isCurrentUserAdmin(): Promise<boolean> {
  if (!hasSupabaseEnv || !supabase) return false;
  const { data: { user } } = await supabase.auth.getUser(); if (!user?.email) return false;
  const { data, error } = await supabase.from('admin_users').select('email,is_active').eq('email', user.email).eq('is_active', true).maybeSingle();
  if (error) { console.error('isCurrentUserAdmin error', error); return false; }
  return Boolean(data);
}
export async function isEmailAdmin(email: string): Promise<boolean> {
  if (!hasSupabaseEnv || !supabase) return false;
  const { data, error } = await supabase.from('admin_users').select('email').eq('email', email).eq('is_active', true).maybeSingle();
  if (error) { console.error('isEmailAdmin error', error); return false; }
  return Boolean(data);
}
export async function sendAdminOtp(email: string) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  if (!(await isEmailAdmin(email))) throw new Error('This email is not authorized for admin access');
  const redirectUrl = getSiteUrl('/admin');
  const { data, error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: redirectUrl } });
  if (error) throw error; return data;
}
export async function verifyAdminSession(): Promise<boolean> { return isCurrentUserAdmin(); }

// --------------------------------------------------
// Live series management
// --------------------------------------------------
export type AdminLiveSeries = { id: number; sport_id: string; title: string | null; is_finished: boolean; gender?: 'male' | 'female' | 'mixed' };
export async function createLiveSeries(sport_id: string, title?: string | null, gender: 'male' | 'female' | 'mixed' = 'male') {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('live_sport_series').insert([{ sport_id, title: title ?? null, gender }]).select('id,sport_id,title,is_finished,gender').single();
  if (error) throw error; return data as AdminLiveSeries;
}
export async function fetchActiveSeriesBySport(sport_id: string): Promise<AdminLiveSeries | null> {
  if (!hasSupabaseEnv || !supabase) return null;
  const { data, error } = await supabase.from('live_sport_series').select('id,sport_id,title,is_finished,gender').eq('sport_id', sport_id).eq('is_finished', false).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error; return (data as AdminLiveSeries) ?? null;
}
export type AdminLiveMatch = { id: number; series_id: number; match_order: number; venue: string | null; stage: 'round_of_16' | 'quarter_final' | 'semi_final' | 'final' | null; faculty1_id: string; faculty2_id: string; faculty1_score: string | null; faculty2_score: string | null; status: string; status_text: string | null; is_finished: boolean; winner_faculty_id: string | null; commentary: string | null };
export async function addLiveMatch(payload: Omit<AdminLiveMatch, 'id' | 'status' | 'is_finished' | 'winner_faculty_id'> & { status?: string; is_finished?: boolean; winner_faculty_id?: string | null }) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  if (payload.faculty1_id && payload.faculty2_id && payload.faculty1_id === payload.faculty2_id) throw new Error('Teams must be different');
  const insertRow = { ...payload, stage: payload.stage || null, status_text: payload.status_text ?? null } as any;
  const { data, error } = await supabase.from('live_series_matches').insert([insertRow]).select('id,series_id,match_order,venue,stage,faculty1_id,faculty2_id,faculty1_score,faculty2_score,status,status_text,is_finished,winner_faculty_id,commentary').single();
  if (error) throw error; return data as AdminLiveMatch;
}
export async function updateLiveMatch(id: number, patch: Partial<Pick<AdminLiveMatch, 'venue'|'stage'|'faculty1_score'|'faculty2_score'|'status'|'status_text'|'is_finished'|'winner_faculty_id'|'commentary'>>) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const normalized: any = { ...patch }; if (normalized.stage === '') normalized.stage = null; if (normalized.status_text === undefined) normalized.status_text = null;
  const { data, error } = await supabase.from('live_series_matches').update(normalized).eq('id', id).select('id,series_id,match_order,venue,stage,faculty1_id,faculty2_id,faculty1_score,faculty2_score,status,status_text,is_finished,winner_faculty_id,commentary').single();
  if (error) throw error; return data as AdminLiveMatch;
}
export async function deleteLiveMatch(id: number) { if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured'); const { error } = await supabase.from('live_series_matches').delete().eq('id', id); if (error) throw error; return true; }
export async function finishSeries(series_id: number, podium: { champion?: string | null; runner_up?: string | null; third?: string | null }) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const champion = podium.champion && podium.champion.trim() !== '' ? podium.champion : null;
  const runner_up = podium.runner_up && podium.runner_up.trim() !== '' ? podium.runner_up : null;
  const third = podium.third && podium.third.trim() !== '' ? podium.third : null;
  const { error } = await supabase
    .from('live_sport_series')
    .update({ is_finished: true, winner_faculty_id: champion, runner_up_faculty_id: runner_up, third_place_faculty_id: third })
    .eq('id', series_id);
  if (error) throw error;
  return true;
}
export async function applySeriesResultsToPointsAndResults(sport_id: string, podium: { champion: string; runner_up: string; third: string }, gender: "Men's" | "Women's" | 'Mixed' = "Men's", series_id?: number) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { data: resRow, error: resErr } = await supabase.from('results').insert([{ sport_id, event: 'Championship Standings', category: 'Team Sport', gender, event_date: new Date().toISOString().slice(0,10), event_time: '00:00:00' }]).select('id').single(); if (resErr) throw resErr;
  const resultId = resRow?.id as number;
  const pos = [ { result_id: resultId, place: 1, faculty_id: podium.champion }, { result_id: resultId, place: 2, faculty_id: podium.runner_up }, { result_id: resultId, place: 3, faculty_id: podium.third } ];
  const { error: posErr } = await supabase.from('result_positions').insert(pos); if (posErr) throw posErr;
  const deltas = new Map<string, number>([[podium.champion,7],[podium.runner_up,5],[podium.third,3]]);
  const facIds = Array.from(deltas.keys()); const { data: existingRows } = await supabase.from('faculty_points').select('faculty_id,mens_points,womens_points').in('faculty_id', facIds);
  const existingMap = new Map<string,{ mens_points: number; womens_points: number }>(); (existingRows||[]).forEach((r:any)=>existingMap.set(r.faculty_id,{ mens_points:Number(r.mens_points??0), womens_points:Number(r.womens_points??0) }));
  const { isMens, isWomens } = parseGenderFlags(gender);
  for (const [faculty_id, delta] of deltas.entries()) {
    const current = existingMap.get(faculty_id);
    if (current) {
  const newMens = (current.mens_points ?? 0) + (isMens ? delta : 0) + (!isMens && !isWomens ? delta : 0);
  const newWomens = (current.womens_points ?? 0) + (isWomens ? delta : 0);
      await supabase.from('faculty_points').update({ mens_points: newMens, womens_points: newWomens, updated_at: new Date().toISOString() }).eq('faculty_id', faculty_id);
    } else {
      const mens = isMens ? delta : (!isMens && !isWomens ? delta : 0);
      const womens = isWomens ? delta : 0;
      await supabase.from('faculty_points').insert([{ faculty_id, mens_points: mens, womens_points: womens, updated_at: new Date().toISOString() }]);
    }
  }
  try {
    let participantFacultyIds: string[] = Array.from(new Set([podium.champion, podium.runner_up, podium.third].filter(Boolean)));
    if (series_id) {
      const { data: matches } = await supabase.from('live_series_matches').select('faculty1_id,faculty2_id').eq('series_id', series_id);
      if (matches) { const ids = new Set<string>(participantFacultyIds); (matches as any[]).forEach(m => { if (m.faculty1_id) ids.add(m.faculty1_id); if (m.faculty2_id) ids.add(m.faculty2_id); }); participantFacultyIds = Array.from(ids); }
    }
    if (participantFacultyIds.length) { const upsertRows = participantFacultyIds.map(fid => ({ faculty_id: fid, sport_id })); await supabase.from('faculty_sports').upsert(upsertRows as any, { onConflict: 'faculty_id,sport_id', ignoreDuplicates: true } as any); }
  } catch (e) { console.warn('series faculty_sports warn', e); }
  try {
    const year = new Date().getFullYear(); const achRows = [ { faculty_id: podium.champion, sport_id, position: 'Champions', year }, { faculty_id: podium.runner_up, sport_id, position: 'Runner-up', year }, { faculty_id: podium.third, sport_id, position: 'Third place', year } ]; await supabase.from('faculty_achievements').insert(achRows);
  } catch (e) { console.warn('series achievements warn', e); }
  return { resultId };
}
export async function applyCustomSeriesResultsAndPoints(args: { sport_id: string; gender: "Men's" | "Women's" | 'Mixed'; placements: Array<{ faculty_id: string; label: 'champion' | 'runner_up' | 'second_runner_up' | 'third_runner_up'; points: number }>; participants?: Array<{ faculty_id: string; points?: number }>; series_id?: number }) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { sport_id, gender, placements, participants = [], series_id } = args;
  const { data: resRow, error: resErr } = await supabase.from('results').insert([{ sport_id, event: 'Championship Standings', category: 'Team Sport', gender, event_date: new Date().toISOString().slice(0,10), event_time: '00:00:00' }]).select('id').single(); if (resErr) throw resErr;
  const resultId = resRow?.id as number;
  const placeMap: Record<'champion'|'runner_up'|'second_runner_up'|'third_runner_up', number> = { champion:1, runner_up:2, second_runner_up:3, third_runner_up:4 };
  const positionsRows = placements.filter(p=>p.faculty_id).map(p=>({ result_id: resultId, place: placeMap[p.label], faculty_id: p.faculty_id })); if (positionsRows.length) { const { error: posErr } = await supabase.from('result_positions').insert(positionsRows); if (posErr) console.error('positions insert error', posErr); }
  const deltas = new Map<string, number>(); placements.forEach(p => deltas.set(p.faculty_id, (deltas.get(p.faculty_id) || 0) + (Number.isFinite(p.points)?Number(p.points):0))); participants.forEach(pp => { if (!pp.faculty_id) return; const pts = Number.isFinite(pp.points as number)?Number(pp.points):1; deltas.set(pp.faculty_id,(deltas.get(pp.faculty_id)||0)+pts); });
  const facIds = Array.from(deltas.keys()); if (facIds.length) {
    const { data: existingRows } = await supabase.from('faculty_points').select('faculty_id,mens_points,womens_points').in('faculty_id', facIds);
  const existingMap = new Map<string,{ mens_points: number; womens_points: number }>(); (existingRows||[]).forEach((r:any)=>existingMap.set(r.faculty_id,{ mens_points:Number(r.mens_points??0), womens_points:Number(r.womens_points??0) }));
    const { isMens, isWomens } = parseGenderFlags(gender);
    for (const [faculty_id, delta] of deltas.entries()) {
      const current = existingMap.get(faculty_id);
      if (current) {
  const newMens = (current.mens_points ?? 0) + (isMens ? delta : 0) + (!isMens && !isWomens ? delta : 0);
  const newWomens = (current.womens_points ?? 0) + (isWomens ? delta : 0);
        await supabase.from('faculty_points').update({ mens_points: newMens, womens_points: newWomens, updated_at: new Date().toISOString() }).eq('faculty_id', faculty_id);
      } else {
        const mens = isMens ? delta : (!isMens && !isWomens ? delta : 0);
        const womens = isWomens ? delta : 0;
        await supabase.from('faculty_points').insert([{ faculty_id, mens_points: mens, womens_points: womens, updated_at: new Date().toISOString() }]);
      }
    }
  }
  try {
    let ids = new Set<string>([...placements.map(p=>p.faculty_id), ...participants.map(p=>p.faculty_id)].filter(Boolean) as string[]);
    if (series_id) { const { data: matches } = await supabase.from('live_series_matches').select('faculty1_id,faculty2_id').eq('series_id', series_id); (matches||[]).forEach((m:any)=>{ if(m.faculty1_id) ids.add(m.faculty1_id); if(m.faculty2_id) ids.add(m.faculty2_id); }); }
    const upsertRows = Array.from(ids).map(fid => ({ faculty_id: fid, sport_id })); if (upsertRows.length) await supabase.from('faculty_sports').upsert(upsertRows as any, { onConflict: 'faculty_id,sport_id', ignoreDuplicates: true } as any);
  } catch (e) { console.warn('faculty_sports upsert warn', e); }
  try {
    const year = new Date().getFullYear(); const labelToPosition: Record<string,string> = { champion:'Champions', runner_up:'Runner-up', second_runner_up:'Second runner-up', third_runner_up:'Third runner-up' };
    const achRows = placements.filter(p=>p.faculty_id).map(p=>({ faculty_id: p.faculty_id, sport_id, position: labelToPosition[p.label] || 'Placement', year })); if (achRows.length) await supabase.from('faculty_achievements').insert(achRows);
  } catch (e) { console.warn('achievements insert warn', e); }
  return { resultId };
}
export async function fetchMatchesBySeries(series_id: number) {
  if (!hasSupabaseEnv || !supabase) return [] as any[];
  const { data, error } = await supabase.from('live_series_matches').select('id,series_id,match_order,venue,stage,faculty1_id,faculty2_id,faculty1_score,faculty2_score,status,status_text,is_finished,winner_faculty_id,commentary').eq('series_id', series_id).order('match_order').order('id');
  if (error) throw error; return (data || []) as any[];
}
export async function completeAllMatchesInSeries(series_id: number) { if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured'); const { error } = await supabase.from('live_series_matches').update({ is_finished: true, status: 'completed', status_text: 'Finished' }).eq('series_id', series_id); if (error) throw error; return true; }
