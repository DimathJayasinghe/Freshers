import { supabase, hasSupabaseEnv } from './supabaseClient';
import { getSiteUrl } from './utils';
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

// -----------------------
// Dangerous cascading helpers for deleting a sport and all references
// Use with caution in admin-only flows.
// -----------------------

export async function deleteScheduledEventsBySport(sportId: string) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('scheduled_events').delete().eq('sport_id', sportId);
  if (error) { console.error('[API] deleteScheduledEventsBySport error', error); throw error; }
}

export async function fetchLiveSeriesIdsBySport(sportId: string): Promise<number[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase.from('live_sport_series').select('id').eq('sport_id', sportId);
  if (error) { console.error('[API] fetchLiveSeriesIdsBySport error', error); throw error; }
  return (data || []).map((r: any) => r.id as number);
}

export async function fetchResultIdsBySport(sportId: string): Promise<number[]> {
  const rows = await fetchResultsBySport(sportId);
  return (rows || []).map((r: any) => r.id as number);
}

export async function deleteAllResultsBySport(sportId: string) {
  const ids = await fetchResultIdsBySport(sportId);
  for (const id of ids) {
    await deleteResult(id);
  }
}

export async function deleteFacultySportsBySport(sportId: string) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('faculty_sports').delete().eq('sport_id', sportId);
  if (error) { console.error('[API] deleteFacultySportsBySport error', error); throw error; }
}

export async function deleteFacultyAchievementsBySport(sportId: string) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('faculty_achievements').delete().eq('sport_id', sportId);
  if (error) { console.error('[API] deleteFacultyAchievementsBySport error', error); throw error; }
}

// Attempt to fully remove a sport and all linked data that reference it.
// Order: schedule -> live series -> results (with positions/points) -> faculty_* -> sport
export async function deleteSportWithCascade(sportId: string) {
  // 1) Scheduled events
  try { await deleteScheduledEventsBySport(sportId); } catch (e) { console.warn('[API] cascade: schedule', e); }
  // 2) Live series (deletes matches via existing helper)
  try {
    const seriesIds = await fetchLiveSeriesIdsBySport(sportId);
    for (const sid of seriesIds) {
      try { await deleteLiveSeries(sid); } catch (e) { console.warn('[API] cascade: live series', sid, e); }
    }
  } catch (e) { console.warn('[API] cascade: fetch live series', e); }
  // 3) Results and positions (removes/reverses points via deleteResult)
  try { await deleteAllResultsBySport(sportId); } catch (e) { console.warn('[API] cascade: results', e); }
  // 4) Faculty participation/achievements rows for this sport
  try { await deleteFacultySportsBySport(sportId); } catch (e) { console.warn('[API] cascade: faculty_sports', e); }
  try { await deleteFacultyAchievementsBySport(sportId); } catch (e) { console.warn('[API] cascade: faculty_achievements', e); }
  // 5) Finally, delete the sport row
  return deleteSport(sportId);
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
  const [fRes, pRes, fsRes, achRes, tmRes, posRes] = await Promise.all([
    supabase.from('faculties').select('id,name,short_name,primary_color,secondary_color,logo_url').eq('id', facultyId).single(),
    supabase.from('faculty_points').select('mens_points,womens_points,total_points').eq('faculty_id', facultyId).single(),
    supabase.from('faculty_sports').select('sports(name)').eq('faculty_id', facultyId),
    supabase.from('faculty_achievements').select('position,year,sports(name)').eq('faculty_id', facultyId).order('year', { ascending: false }),
    supabase.from('faculty_team_members').select('name,role,sports(name)').eq('faculty_id', facultyId),
    // placements from results to derive accurate event year per sport/place
    supabase.from('result_positions').select('place,results(event_date,sports(name))').eq('faculty_id', facultyId),
  ]);

  if (fRes.error) { console.error('[API] faculty error', fRes.error); throw fRes.error; }
  const f = fRes.data;
  if (!f) return null;

  if (pRes.error && pRes.error.code !== 'PGRST116') { console.error('[API] points error', pRes.error); throw pRes.error; }
  if (fsRes.error) { console.error('[API] fs error', fsRes.error); throw fsRes.error; }
  if (achRes.error) { console.error('[API] ach error', achRes.error); throw achRes.error; }
  if (tmRes.error) { console.error('[API] team error', tmRes.error); throw tmRes.error; }
  if (posRes.error) { console.error('[API] placements error', posRes.error); throw posRes.error; }

  const sports = ((fsRes.data || []) as { sports?: { name: string } | { name: string }[] | null }[])
    .map((r) => (Array.isArray(r.sports) ? (r.sports as { name: string }[])[0]?.name : (r.sports as { name: string } | null | undefined)?.name))
    .filter(Boolean) as string[];
  // Build a map of latest event year by (sport, place) from results/positions join
  const placements = ((posRes.data || []) as { place: number; results?: { event_date: string; sports?: { name: string } | { name: string }[] | null } | { event_date: string; sports?: { name: string } | { name: string }[] | null }[] | null }[])
    .map((r) => {
      const res = Array.isArray(r.results) ? (r.results as any[])[0] : (r.results as any);
      const sportName = res ? (Array.isArray(res.sports) ? (res.sports as { name: string }[])[0]?.name : (res.sports as { name: string } | null | undefined)?.name) : null;
      const year = res?.event_date ? new Date(res.event_date).getFullYear() : null;
      return { sport: sportName as string | null, place: r.place, year: year as number | null };
    })
    .filter(p => !!p.sport && !!p.place) as { sport: string; place: number; year: number | null }[];
  const latestYearBySportPlace = new Map<string, number>();
  placements.forEach((p) => {
    const key = `${p.sport}|${p.place}`;
    const prev = latestYearBySportPlace.get(key) ?? 0;
    const y = p.year ?? 0;
    if (y > prev) latestYearBySportPlace.set(key, y);
  });

  // Map textual position label to numeric place
  const labelToPlace = (txt: string): number | null => {
    const p = txt.toLowerCase();
    if (/second\s*runner/.test(p)) return 3; // check before generic runner-up
    if (/third\s*runner/.test(p)) return 4;
    if (/(^|\b)(1st|champ|champion|gold|winner)(\b|$)/.test(p)) return 1;
    if (/(^|\b)(2nd|runner-up|runner up|runner|silver)(\b|$)/.test(p)) return 2;
    if (/(^|\b)(3rd|third|bronze)(\b|$)/.test(p)) return 3;
    if (/(^|\b)(4th|fourth)(\b|$)/.test(p)) return 4;
    return null;
  };

  const dbAchievements = ((achRes.data || []) as { position: string; year: number | null; sports?: { name: string } | { name: string }[] | null }[])
    .map((r) => {
      const sportName = (Array.isArray(r.sports) ? (r.sports as { name: string }[])[0]?.name : (r.sports as { name: string } | null | undefined)?.name) ?? null;
      const label = r.position;
      const place = labelToPlace(label);
      let year: number | null = r.year ?? null;
      if (sportName && place) {
        const key = `${sportName}|${place}`;
        const fromResults = latestYearBySportPlace.get(key);
        if (fromResults) year = fromResults; // prefer authoritative results year
      }
      return { sport: sportName, position: label, year };
    });

  // Build achievements directly from placements in results (ensures champions show even if achievements table wasn't populated)
  const placeToLabel = (place: number): string => {
    switch (place) {
      case 1: return 'Champion';
      case 2: return 'Runner-up';
      case 3: return 'Third place';
      case 4: return 'Fourth place';
      default: return `${place}`; // fallback label; UI will still categorize by place
    }
  };
  const resAchievements = placements
    .filter(p => p.sport && p.place)
    .map(p => ({ sport: p.sport, position: placeToLabel(p.place), year: p.year })) as { sport: string | null; position: string; year: number | null }[];

  // Merge DB and results achievements, dedupe by sport|position|year
  const mergedMap = new Map<string, { sport: string | null; position: string; year: number | null }>();
  [...dbAchievements, ...resAchievements].forEach((a) => {
    const key = `${a.sport ?? ''}|${(a.position || '').toLowerCase()}|${a.year ?? ''}`;
    if (!mergedMap.has(key)) mergedMap.set(key, a);
  });
  const achievements = Array.from(mergedMap.values());
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

// -----------------------
// Live fixtures by sport (for Live Results page)
// -----------------------
export type LiveFixture = {
  id: number;
  sport_id: string;
  sport_name: string;
  venue: string; // e.g., Court 1
  team1: string;
  team2: string;
  team1_score: string | null;
  team2_score: string | null;
  status: string; // 'live' | 'scheduled' | 'completed' ...
  status_text: string | null;
};

// Distinct ongoing sports (status='live') -> [{ id, name }]
export async function fetchOngoingSports(): Promise<{ id: string; name: string }[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  // Pull distinct sport ids from live fixtures and join names
  const { data, error } = await supabase
    .from('fixtures')
    .select('sport_id, sports(name)')
    .eq('status', 'live');
  if (error) {
    console.error('[API] fetchOngoingSports error', error);
    throw error;
  }
  const seen = new Map<string, string>();
  (data as any[] | null || []).forEach((row) => {
    const sportId = row.sport_id as string;
    const sObj = Array.isArray(row.sports) ? row.sports[0] : row.sports;
    const name = sObj?.name as string | undefined;
    if (sportId && name && !seen.has(sportId)) seen.set(sportId, name);
  });
  return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
}

export async function fetchLiveFixturesBySport(sportId: string): Promise<LiveFixture[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase
    .from('fixtures')
    .select('id,sport_id,venue,status,status_text,team1_score,team2_score, sports(name), team1:faculties!fixtures_team1_faculty_id_fkey(name), team2:faculties!fixtures_team2_faculty_id_fkey(name)')
    .eq('sport_id', sportId)
    .eq('status', 'live')
    .order('id', { ascending: true });
  if (error) {
    console.error('[API] fetchLiveFixturesBySport error', error);
    throw error;
  }
  // Note: PostgREST embeds for faculties may come as arrays or single objects depending on configuration
  const rows = (data || []) as any[];
  return rows.map((r) => {
    const sportObj = Array.isArray(r.sports) ? r.sports[0] : r.sports;
    const t1 = (Array.isArray(r.team1) ? r.team1[0] : r.team1) || { name: '' };
    const t2 = (Array.isArray(r.team2) ? r.team2[0] : r.team2) || { name: '' };
    return {
      id: r.id as number,
      sport_id: r.sport_id as string,
      sport_name: sportObj?.name as string,
      venue: r.venue as string,
      team1: t1?.name as string,
      team2: t2?.name as string,
      team1_score: (r.team1_score ?? null) as string | null,
      team2_score: (r.team2_score ?? null) as string | null,
      status: r.status as string,
      status_text: (r.status_text ?? null) as string | null,
    } satisfies LiveFixture;
  });
}

// Admin helper: update fixture scores and/or status (triggers realtime)
export async function updateFixture(
  id: number,
  payload: Partial<{ team1_score: string | null; team2_score: string | null; status: string; status_text: string | null; winner_faculty_id: string | null }>
) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('fixtures').update(payload).eq('id', id).select();
  if (error) {
    console.error('[API] updateFixture error', error);
    throw error;
  }
  return data;
}

// -----------------------
// Live results (New live schema) — public fetch helpers
// -----------------------

export async function fetchLiveSportsNow(): Promise<{ id: string; name: string }[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase.from('live_sports_now').select('sport_id,sport_name');
  if (error) { console.error('[API] fetchLiveSportsNow error', error); throw error; }
  const rows = (data || []) as { sport_id: string; sport_name: string }[];
  return rows.map(r => ({ id: r.sport_id, name: r.sport_name }));
}

export type LiveSeriesMatchView = {
  id: number;
  series_id: number;
  sport_id: string;
  sport_name: string;
  gender?: 'male' | 'female' | 'mixed';
  match_order: number;
  venue: string | null;
  stage: string | null;
  status: string;
  status_text: string | null;
  team1: string;
  team2: string;
  team1_score: string | null;
  team2_score: string | null;
  is_finished: boolean;
  winner_name: string | null;
  commentary?: string | null;
};

export async function fetchLiveSeriesMatchesBySport(sportId: string): Promise<LiveSeriesMatchView[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase
    .from('live_series_matches_view')
    .select('id,series_id,sport_id,sport_name,gender,match_order,venue,stage,status,status_text,team1,team2,team1_score,team2_score,is_finished,winner_name,commentary')
    .eq('sport_id', sportId)
    .order('match_order', { ascending: true })
    .order('id', { ascending: true });
  if (error) { console.error('[API] fetchLiveSeriesMatchesBySport error', error); throw error; }
  return (data || []) as LiveSeriesMatchView[];
}

export async function fetchActiveSeriesIdsBySport(sportId: string): Promise<number[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const { data, error } = await supabase
    .from('live_sport_series')
    .select('id')
    .eq('sport_id', sportId)
    .eq('is_finished', false);
  if (error) { console.error('[API] fetchActiveSeriesIdsBySport error', error); throw error; }
  return (data || []).map((r: any) => r.id as number);
}

// Delete a live series (will cascade delete matches); use after publishing/finalization
export async function deleteLiveSeries(series_id: number) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('live_sport_series').delete().eq('id', series_id);
  if (error) { console.error('[API] deleteLiveSeries error', error); throw error; }
  return true;
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
function scoreForPlace(place: number, custom?: Record<number, number>) {
  if (custom && Number.isFinite(custom[place])) return Number(custom[place]);
  if (place === 1) return 7;
  if (place === 2) return 5;
  if (place === 3) return 3;
  if (place === 4) return 2;
  return 1; // 5th and beyond
}

// Apply points for an overall result (adds to faculty_points mens_points/womens_points)
export async function applyPointsForResult(
  resultId: number,
  customPoints?: Record<number, number>,
  mode: 'overall-only' | 'always' = 'overall-only'
) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');

  // fetch result and positions
  const rRes = await supabase.from('results').select('id,event,gender').eq('id', resultId).single();
  if (rRes.error) { console.error('[API] applyPointsForResult result fetch error', rRes.error); throw rRes.error; }
  const result = rRes.data as { id: number; event: string | null; gender: string | null } | null;
  if (!result) throw new Error('Result not found');

  // Apply only for 'overall' results unless forced to always
  const name = (result.event || '').toLowerCase();
  const isOverall = name.includes('overall') || name.trim() === '';
  if (mode === 'overall-only' && !isOverall) return null;

  const pos = await fetchResultPositions(resultId);
  if (!pos || pos.length === 0) return null;

  // accumulate deltas per faculty
  const deltas = new Map<string, number>();
  pos.forEach((p) => {
    const pts = scoreForPlace(p.place, customPoints);
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
export async function removePointsForResult(
  resultId: number,
  customPoints?: Record<number, number>,
  mode: 'overall-only' | 'always' = 'overall-only'
) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const rRes = await supabase.from('results').select('id,event,gender').eq('id', resultId).single();
  if (rRes.error) { console.error('[API] removePointsForResult result fetch error', rRes.error); throw rRes.error; }
  const result = rRes.data as { id: number; event: string | null; gender: string | null } | null;
  if (!result) return null;
  const name = (result.event || '').toLowerCase();
  const isOverall = name.includes('overall') || name.trim() === '';
  if (mode === 'overall-only' && !isOverall) return null;

  const pos = await fetchResultPositions(resultId);
  if (!pos || pos.length === 0) return null;

  const deltas = new Map<string, number>();
  pos.forEach((p) => {
    const pts = scoreForPlace(p.place, customPoints);
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

// Update a result row's metadata
export async function updateResultRow(resultId: number, payload: Partial<{ event: string | null; category: 'Team Sport' | 'Individual Sport' | 'Athletics' | 'Swimming'; gender: "Men's" | "Women's" | 'Mixed'; event_date: string; event_time: string }>) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const patch: any = { ...payload };
  if (Object.prototype.hasOwnProperty.call(patch, 'event') && patch.event === '') patch.event = null;
  const { data, error } = await supabase.from('results').update(patch).eq('id', resultId).select('id,event,category,gender,event_date,event_time').single();
  if (error) { console.error('[API] updateResultRow error', error); throw error; }
  return data as { id: number; event: string | null; category: string; gender: string; event_date: string; event_time: string };
}

// Replace positions for a result and re-apply leaderboard points for overall-style results
export async function replaceResultPositionsAndReapply(
  resultId: number,
  positions: Array<{ place: number; faculty_id: string }>,
  customPoints?: Record<number, number>,
  participants?: Array<{ faculty_id: string; points?: number }>,
  applyMode: 'overall-only' | 'always' = 'overall-only'
) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  // Reverse any previously applied points (only for overall-style)
  try {
  await removePointsForResult(resultId, customPoints, applyMode);
  } catch (e) {
    console.warn('[API] replaceResultPositions: remove points warn', e);
  }
  // Replace positions
  const { error: delErr } = await supabase.from('result_positions').delete().eq('result_id', resultId);
  if (delErr) { console.error('[API] replaceResultPositions delete error', delErr); throw delErr; }
  const rows = (positions || []).filter(p => p.faculty_id && Number(p.place) > 0).map(p => ({ result_id: resultId, place: Number(p.place), faculty_id: p.faculty_id }));
  if (rows.length > 0) {
    const { error: insErr } = await supabase.from('result_positions').insert(rows);
    if (insErr) { console.error('[API] replaceResultPositions insert error', insErr); throw insErr; }
  }
  // Re-apply based on new positions
  try {
  await applyPointsForResult(resultId, customPoints, applyMode);
  } catch (e) {
    console.warn('[API] replaceResultPositions: apply points warn', e);
  }

  // Apply participant points (for faculties not in placements) if provided
  try {
    const part = (participants || []).filter(p => p.faculty_id);
    if (part.length > 0) {
      // Remove any participants that are already in placements
      const placedIds = new Set<string>(positions.map(p => p.faculty_id));
      const filtered = part.filter(p => !placedIds.has(p.faculty_id));
      if (filtered.length > 0) {
        // Fetch result gender to decide which points column to adjust
        const rRes = await supabase!.from('results').select('gender').eq('id', resultId).single();
        const gender = (rRes.data?.gender as string | null) ?? '';
        const isMens = /men/i.test(gender || '');
        const isWomens = /women/i.test(gender || '');

        // Accumulate deltas per faculty
        const deltas = new Map<string, number>();
        filtered.forEach(p => {
          const pts = Number.isFinite(p.points as number) ? Number(p.points) : 1;
          deltas.set(p.faculty_id, (deltas.get(p.faculty_id) || 0) + pts);
        });
        const facIds = Array.from(deltas.keys());
        const { data: existingRows } = await supabase!.from('faculty_points').select('faculty_id,mens_points,womens_points').in('faculty_id', facIds as string[]);
        const existingMap = new Map<string, { mens_points: number | null; womens_points: number | null }>();
        (existingRows || []).forEach((r: any) => existingMap.set(r.faculty_id, { mens_points: r.mens_points ?? 0, womens_points: r.womens_points ?? 0 }));

        for (const [faculty_id, delta] of deltas.entries()) {
          const current = existingMap.get(faculty_id);
          if (current) {
            const newMens = (current.mens_points ?? 0) + (isMens ? delta : 0) + (!isMens && !isWomens ? delta : 0);
            const newWomens = (current.womens_points ?? 0) + (isWomens ? delta : 0);
            await supabase!.from('faculty_points').update({ mens_points: newMens, womens_points: newWomens, updated_at: new Date().toISOString() }).eq('faculty_id', faculty_id);
          } else {
            const mens = isMens ? delta : (!isMens && !isWomens ? delta : 0);
            const womens = isWomens ? delta : 0;
            await supabase!.from('faculty_points').insert([{ faculty_id, mens_points: mens, womens_points: womens, updated_at: new Date().toISOString() }]);
          }
        }
      }
    }
  } catch (e) {
    console.warn('[API] replaceResultPositions: participant points warn', e);
  }
  return true;
}

// =======================
// Admin helpers (auth + live management)
// =======================

export async function isCurrentUserAdmin(): Promise<boolean> {
  if (!hasSupabaseEnv || !supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return false;
  const { data, error } = await supabase.from('admin_users').select('email,is_active').eq('email', user.email).eq('is_active', true).maybeSingle();
  if (error) { console.error('[API] isCurrentUserAdmin error', error); return false; }
  return Boolean(data);
}

export async function isEmailAdmin(email: string): Promise<boolean> {
  if (!hasSupabaseEnv || !supabase) return false;
  const { data, error } = await supabase.from('admin_users').select('email').eq('email', email).eq('is_active', true).maybeSingle();
  if (error) { console.error('[API] isEmailAdmin error', error); return false; }
  return Boolean(data);
}

export async function sendAdminOtp(email: string) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const allowed = await isEmailAdmin(email);
  if (!allowed) {
    throw new Error('This email is not authorized for admin access');
  }
  // Build redirect URL for production (Netlify) or local dev
  const redirectUrl = getSiteUrl('/admin');
  // Allow auto-create for whitelisted admin email to avoid "Signups not allowed for otp" when no user exists yet
  const { data, error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: redirectUrl } });
  if (error) throw error;
  return data;
}

export async function verifyAdminSession(): Promise<boolean> {
  // Ensures current session user is an active admin
  return isCurrentUserAdmin();
}

// Live Series (admin)
export type AdminLiveSeries = { id: number; sport_id: string; title: string | null; is_finished: boolean; gender?: 'male' | 'female' | 'mixed' };
export async function createLiveSeries(sport_id: string, title?: string | null, gender: 'male' | 'female' | 'mixed' = 'male'): Promise<AdminLiveSeries | null> {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('live_sport_series').insert([{ sport_id, title: title ?? null, gender }]).select('id,sport_id,title,is_finished,gender').single();
  if (error) { console.error('[API] createLiveSeries error', error); throw error; }
  return data as AdminLiveSeries;
}

export async function fetchActiveSeriesBySport(sport_id: string): Promise<AdminLiveSeries | null> {
  if (!hasSupabaseEnv || !supabase) return null;
  const { data, error } = await supabase.from('live_sport_series').select('id,sport_id,title,is_finished,gender').eq('sport_id', sport_id).eq('is_finished', false).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) { console.error('[API] fetchActiveSeriesBySport error', error); throw error; }
  return (data as AdminLiveSeries) ?? null;
}

export type AdminLiveMatch = {
  id: number; series_id: number; match_order: number; venue: string | null; stage: 'round_of_16' | 'quarter_final' | 'semi_final' | 'final' | null;
  faculty1_id: string; faculty2_id: string; faculty1_score: string | null; faculty2_score: string | null; status: string; status_text: string | null; is_finished: boolean; winner_faculty_id: string | null; commentary: string | null;
};
export async function addLiveMatch(payload: Omit<AdminLiveMatch, 'id' | 'status' | 'is_finished' | 'winner_faculty_id'> & { status?: string; is_finished?: boolean; winner_faculty_id?: string | null }) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { id, ...rest } = (payload as any);
  // Client-side guardrails to avoid DB check constraint violations
  if (rest.faculty1_id && rest.faculty2_id && rest.faculty1_id === rest.faculty2_id) {
    throw new Error('Teams must be different (Team 1 and Team 2 cannot be the same)');
  }
  const insertRow = {
    ...rest,
    // Ensure stage is null if unset, not empty string
    stage: rest.stage || null,
    // Ensure status_text nulls instead of empty/undefined
    status_text: rest.status_text ?? null,
  };
  const { data, error } = await supabase
    .from('live_series_matches')
    .insert([insertRow])
    .select('id,series_id,match_order,venue,stage,faculty1_id,faculty2_id,faculty1_score,faculty2_score,status,status_text,is_finished,winner_faculty_id,commentary')
    .single();
  if (error) { console.error('[API] addLiveMatch error', error); throw error; }
  return data as AdminLiveMatch;
}

export async function updateLiveMatch(id: number, patch: Partial<Pick<AdminLiveMatch, 'venue'|'stage'|'faculty1_score'|'faculty2_score'|'status'|'status_text'|'is_finished'|'winner_faculty_id'|'commentary'>>) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const normalized: any = { ...patch };
  if (Object.prototype.hasOwnProperty.call(normalized, 'stage') && normalized.stage === '') normalized.stage = null;
  if (Object.prototype.hasOwnProperty.call(normalized, 'status_text') && (normalized.status_text === undefined)) normalized.status_text = null;
  const { data, error } = await supabase
    .from('live_series_matches')
    .update(normalized)
    .eq('id', id)
    .select('id,series_id,match_order,venue,stage,faculty1_id,faculty2_id,faculty1_score,faculty2_score,status,status_text,is_finished,winner_faculty_id,commentary')
    .single();
  if (error) { console.error('[API] updateLiveMatch error', error); throw error; }
  return data as AdminLiveMatch;
}

// Delete a specific live match
export async function deleteLiveMatch(id: number) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('live_series_matches').delete().eq('id', id);
  if (error) { console.error('[API] deleteLiveMatch error', error); throw error; }
  return true;
}

export async function finishSeries(series_id: number, podium: { champion: string; runner_up: string; third: string }) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('live_sport_series').update({ is_finished: true, winner_faculty_id: podium.champion, runner_up_faculty_id: podium.runner_up, third_place_faculty_id: podium.third }).eq('id', series_id);
  if (error) { console.error('[API] finishSeries error', error); throw error; }
  return true;
}

// Apply leaderboard points and write a results row (overall standings)
export async function applySeriesResultsToPointsAndResults(
  sport_id: string,
  podium: { champion: string; runner_up: string; third: string },
  gender: "Men's" | "Women's" | 'Mixed' = "Men's",
  series_id?: number
) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  // Create/insert results row for standings
  const { data: resRow, error: resErr } = await supabase.from('results').insert([{ sport_id, event: 'Championship Standings', category: 'Team Sport', gender, event_date: new Date().toISOString().slice(0,10), event_time: '00:00:00' }]).select('id').single();
  if (resErr) { console.error('[API] applySeries: results insert error', resErr); throw resErr; }
  const resultId = resRow?.id as number;
  // positions: 1..3 from podium, and optional participants from faculties who played (could be passed in separately later)
  const pos: { result_id: number; place: number; faculty_id: string }[] = [
    { result_id: resultId, place: 1, faculty_id: podium.champion },
    { result_id: resultId, place: 2, faculty_id: podium.runner_up },
    { result_id: resultId, place: 3, faculty_id: podium.third },
  ];
  const { error: posErr } = await supabase.from('result_positions').insert(pos);
  if (posErr) { console.error('[API] applySeries: positions insert error', posErr); throw posErr; }

  // Apply points mapping as requested
  const deltas = new Map<string, number>([
    [podium.champion, 7],
    [podium.runner_up, 5],
    [podium.third, 3],
  ]);
  // Optionally, everyone else who participated gets 1 point — this can be handled later by passing an array of participants.

  // Fetch existing rows
  const facIds = Array.from(deltas.keys());
  const { data: existingRows } = await supabase.from('faculty_points').select('faculty_id,mens_points,womens_points').in('faculty_id', facIds);
  const existingMap = new Map<string, { mens_points: number | null; womens_points: number | null }>();
  (existingRows || []).forEach((r: any) => existingMap.set(r.faculty_id, { mens_points: r.mens_points ?? 0, womens_points: r.womens_points ?? 0 }));
  const isMens = /men/i.test(gender);
  const isWomens = /women/i.test(gender);

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
  // Update faculty participation (faculty_sports) for everyone who took part in this series
  try {
    let participantFacultyIds: string[] = Array.from(new Set([podium.champion, podium.runner_up, podium.third].filter(Boolean)));
    if (series_id) {
      const { data: matches, error: mErr } = await supabase
        .from('live_series_matches')
        .select('faculty1_id,faculty2_id')
        .eq('series_id', series_id);
      if (!mErr && matches) {
        const ids = new Set<string>(participantFacultyIds);
        (matches as any[]).forEach((m) => { if (m.faculty1_id) ids.add(m.faculty1_id); if (m.faculty2_id) ids.add(m.faculty2_id); });
        participantFacultyIds = Array.from(ids);
      }
    }

    if (participantFacultyIds.length > 0) {
      const upsertRows = participantFacultyIds.map((fid) => ({ faculty_id: fid, sport_id }));
      // Upsert on composite key so we don't create duplicates
      await supabase.from('faculty_sports').upsert(upsertRows as any, { onConflict: 'faculty_id,sport_id', ignoreDuplicates: true } as any);
    }
  } catch (e) {
    console.warn('[API] applySeries: faculty_sports upsert warn', e);
  }

  // Insert achievements for champion/runner-up/third
  try {
    const year = new Date().getFullYear();
    const achRows = [
      { faculty_id: podium.champion, sport_id, position: 'Champions', year },
      { faculty_id: podium.runner_up, sport_id, position: 'Runner-up', year },
      { faculty_id: podium.third, sport_id, position: 'Third place', year },
    ];
    await supabase.from('faculty_achievements').insert(achRows);
  } catch (e) {
    console.warn('[API] applySeries: achievements insert warn', e);
  }

  return { resultId };
}

// Customizable placements and participation points for a series
export async function applyCustomSeriesResultsAndPoints(args: {
  sport_id: string;
  gender: "Men's" | "Women's" | 'Mixed';
  placements: Array<{ faculty_id: string; label: 'champion' | 'runner_up' | 'second_runner_up' | 'third_runner_up'; points: number }>;
  participants?: Array<{ faculty_id: string; points?: number }>;
  series_id?: number;
}) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { sport_id, gender, placements, participants = [], series_id } = args;

  // 1) Create a result row (overall standings)
  const { data: resRow, error: resErr } = await supabase
    .from('results')
    .insert([{ sport_id, event: 'Championship Standings', category: 'Team Sport', gender, event_date: new Date().toISOString().slice(0,10), event_time: '00:00:00' }])
    .select('id')
    .single();
  if (resErr) { console.error('[API] applyCustom: results insert error', resErr); throw resErr; }
  const resultId = resRow?.id as number;

  // 2) Insert placements into result_positions with numeric place mapping
  const placeMap: Record<'champion' | 'runner_up' | 'second_runner_up' | 'third_runner_up', number> = {
    champion: 1,
    runner_up: 2,
    second_runner_up: 3,
    third_runner_up: 4,
  };
  const positionsRows = placements
    .filter(p => p.faculty_id)
    .map(p => ({ result_id: resultId, place: placeMap[p.label], faculty_id: p.faculty_id }));
  if (positionsRows.length > 0) {
    const { error: posErr } = await supabase.from('result_positions').insert(positionsRows);
    if (posErr) { console.error('[API] applyCustom: positions insert error', posErr); }
  }

  // 3) Points aggregation (placements + participants)
  const deltas = new Map<string, number>();
  placements.forEach(p => {
    const pts = Number.isFinite(p.points) ? Number(p.points) : 0;
    deltas.set(p.faculty_id, (deltas.get(p.faculty_id) || 0) + pts);
  });
  participants.forEach(pp => {
    const pts = Number.isFinite(pp.points as number) ? Number(pp.points) : 1;
    if (pp.faculty_id) deltas.set(pp.faculty_id, (deltas.get(pp.faculty_id) || 0) + pts);
  });

  // 4) Update faculty_points by gender
  const facIds = Array.from(deltas.keys());
  if (facIds.length > 0) {
    const { data: existingRows } = await supabase.from('faculty_points').select('faculty_id,mens_points,womens_points').in('faculty_id', facIds);
    const existingMap = new Map<string, { mens_points: number | null; womens_points: number | null }>();
    (existingRows || []).forEach((r: any) => existingMap.set(r.faculty_id, { mens_points: r.mens_points ?? 0, womens_points: r.womens_points ?? 0 }));

    const isMens = /men/i.test(gender);
    const isWomens = /women/i.test(gender);

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

  // 5) faculty_sports upsert (placements + participants + matches by series)
  try {
    let ids = new Set<string>([...placements.map(p => p.faculty_id), ...participants.map(p => p.faculty_id)].filter(Boolean) as string[]);
    if (series_id) {
      const { data: matches } = await supabase.from('live_series_matches').select('faculty1_id,faculty2_id').eq('series_id', series_id);
      (matches || []).forEach((m: any) => { if (m.faculty1_id) ids.add(m.faculty1_id); if (m.faculty2_id) ids.add(m.faculty2_id); });
    }
    const upsertRows = Array.from(ids).map(fid => ({ faculty_id: fid, sport_id }));
    if (upsertRows.length > 0) {
      await supabase.from('faculty_sports').upsert(upsertRows as any, { onConflict: 'faculty_id,sport_id', ignoreDuplicates: true } as any);
    }
  } catch (e) {
    console.warn('[API] applyCustom: faculty_sports upsert warn', e);
  }

  // 6) achievements for placements with labels
  try {
    const year = new Date().getFullYear();
    const labelToPosition: Record<string, string> = {
      champion: 'Champions',
      runner_up: 'Runner-up',
      second_runner_up: 'Second runner-up',
      third_runner_up: 'Third runner-up',
    };
    const achRows = placements
      .filter(p => p.faculty_id)
      .map(p => ({ faculty_id: p.faculty_id, sport_id, position: labelToPosition[p.label] || 'Placement', year }));
    if (achRows.length > 0) await supabase.from('faculty_achievements').insert(achRows);
  } catch (e) {
    console.warn('[API] applyCustom: achievements insert warn', e);
  }

  return { resultId };
}

// Fetch matches for a series (admin view)
export async function fetchMatchesBySeries(series_id: number) {
  if (!hasSupabaseEnv || !supabase) return [] as Array<{
    id: number; match_order: number; venue: string | null; stage: string | null; faculty1_id: string; faculty2_id: string; faculty1_score: string | null; faculty2_score: string | null; status: string; status_text: string | null; is_finished: boolean; winner_faculty_id: string | null;
  }>;
  const { data, error } = await supabase
    .from('live_series_matches')
    .select('id,series_id,match_order,venue,stage,faculty1_id,faculty2_id,faculty1_score,faculty2_score,status,status_text,is_finished,winner_faculty_id,commentary')
    .eq('series_id', series_id)
    .order('match_order', { ascending: true })
    .order('id', { ascending: true });
  if (error) { console.error('[API] fetchMatchesBySeries error', error); throw error; }
  return (data || []) as any[];
}

// Mark all matches in a series as finished (so they disappear from the live view)
export async function completeAllMatchesInSeries(series_id: number) {
  if (!hasSupabaseEnv || !supabase) throw new Error('Supabase not configured');
  const { error } = await supabase
    .from('live_series_matches')
    .update({ is_finished: true, status: 'completed', status_text: 'Finished' })
    .eq('series_id', series_id);
  if (error) { console.error('[API] completeAllMatchesInSeries error', error); throw error; }
  return true;
}
