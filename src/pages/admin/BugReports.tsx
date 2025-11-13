import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { AdminHeader } from "@/components/AdminHeader";
import { fetchBugReports, updateBugReportStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";

type BugReport = {
  id: number;
  created_at: string;
  title: string;
  description: string;
  page_url: string | null;
  contact: string | null;
  user_agent: string | null;
  status: "open" | "resolved";
};

const BugReportsPage: React.FC = () => {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("open");
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await fetchBugReports();
        setReports((rows as any[]) as BugReport[]);
      } catch (e: any) {
        setError(e?.message || "Failed to load bug reports");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return reports;
    return reports.filter((r) => r.status === filter);
  }, [reports, filter]);

  async function setStatus(id: number, status: "open" | "resolved") {
    setUpdatingIds((arr) => (arr.includes(id) ? arr : [...arr, id]));
    try {
      await updateBugReportStatus(id, status);
      setReports((arr) => arr.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (e) {
      alert((e as any)?.message || "Failed to update status");
    } finally {
      setUpdatingIds((arr) => arr.filter((x) => x !== id));
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminHeader />
      <AdminLayout title="Bug Reports">
        <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="font-semibold">Bug Reports</h3>
            <div className="flex items-center gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm"
              >
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
                <option value="all">All</option>
              </select>
              <Button
                variant="outline"
                onClick={async () => {
                  // Simple refresh
                  setLoading(true);
                  try {
                    const rows = await fetchBugReports();
                    setReports((rows as any[]) as BugReport[]);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Refresh
              </Button>
            </div>
          </div>

          {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
          {loading ? (
            <div className="text-sm text-gray-400">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-gray-400">No reports.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => (
                <div key={r.id} className="border border-zinc-800 rounded-lg p-3 bg-black/40">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-white">{r.title}</div>
                      <div className="text-xs text-gray-400">#{r.id} • {new Date(r.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${r.status === 'open' ? 'border-yellow-600 text-yellow-400' : 'border-green-700 text-green-400'}`}>{r.status}</span>
                      {r.status === 'open' ? (
                        <Button size="sm" onClick={() => setStatus(r.id, 'resolved')} disabled={updatingIds.includes(r.id)}>Mark resolved</Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setStatus(r.id, 'open')} disabled={updatingIds.includes(r.id)}>Reopen</Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-300 whitespace-pre-wrap">{r.description}</div>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-400">
                    <div>Page: <a className="text-blue-400 hover:underline" href={r.page_url || '#'} target="_blank" rel="noreferrer">{r.page_url || '-'}</a></div>
                    <div>Contact: {r.contact || '-'}</div>
                    <div className="md:col-span-3 truncate" title={r.user_agent || ''}>UA: {r.user_agent || '-'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </div>
  );
};

export default BugReportsPage;
