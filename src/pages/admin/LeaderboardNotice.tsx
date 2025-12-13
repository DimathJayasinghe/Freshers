import { useEffect, useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchLatestNoticeForAdmin, saveLeaderboardNotice } from "@/lib/api";
import type { LeaderboardNotice } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminLeaderboardNotice: React.FC = () => {
  const [notice, setNotice] = useState<LeaderboardNotice | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetchLatestNoticeForAdmin()
      .then((data) => {
        if (!mounted || !data) return;
        setNotice(data);
        setTitle(data.title ?? "");
        setBody(data.body);
        setIsPublished(data.isPublished);
        setSavedAt(data.updatedAt);
        setJustSaved(false);
      })
      .catch((err) => {
        console.error('[AdminLeaderboardNotice] fetch error', err);
        setError(err?.message ?? 'Failed to load notice');
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setJustSaved(false);
    if (!body.trim()) {
      setError('Notice body cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const updated = await saveLeaderboardNotice({
        id: notice?.id,
        title: title.trim() ? title.trim() : null,
        body: body.trim(),
        isPublished,
      });
      setNotice(updated);
      setTitle(updated.title ?? "");
      setBody(updated.body);
      setIsPublished(updated.isPublished);
      setSavedAt(updated.updatedAt);
      setJustSaved(true);
    } catch (err: any) {
      console.error('[AdminLeaderboardNotice] save error', err);
      setError(err?.message ?? 'Failed to save notice');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminHeader />
      <AdminLayout title="Leaderboard Notice">
        <Card className="bg-zinc-900 border border-red-500/30">
          <CardHeader>
            <CardTitle className="text-white text-xl">Leaderboard Notice Board</CardTitle>
            <p className="text-sm text-gray-400">
              Publish a short update that appears above the public leaderboard.
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-gray-400">Loading notice…</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notice-title" className="text-gray-300">Title (optional)</Label>
                  <Input
                    id="notice-title"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setJustSaved(false); }}
                    placeholder="Leaderboard update"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notice-body" className="text-gray-300">Message</Label>
                  <textarea
                    id="notice-body"
                    value={body}
                    onChange={(e) => { setBody(e.target.value); setJustSaved(false); }}
                    rows={8}
                    className="w-full rounded-md border border-zinc-700 bg-black/60 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    placeholder="Share important updates, highlights, or reminders for the leaderboard audience."
                  />
                  <p className="text-xs text-gray-500">
                    Supports plain text. Use line breaks to separate paragraphs.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="notice-published"
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => { setIsPublished(e.target.checked); setJustSaved(false); }}
                    className="h-4 w-4 rounded border border-zinc-600 bg-black focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                  <Label htmlFor="notice-published" className="text-sm text-gray-300">
                    Show on public leaderboard
                  </Label>
                </div>
                {savedAt && (
                  <div className="text-xs text-gray-500">
                    Last saved {new Date(savedAt).toLocaleString()}
                  </div>
                )}
                {error && (
                  <div className="text-sm text-red-400">{error}</div>
                )}
                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={saving} className="bg-yellow-600 hover:bg-yellow-500 text-black">
                    {saving ? 'Saving…' : 'Save notice'}
                  </Button>
                  {!saving && !error && justSaved && (
                    <span className="text-xs text-green-400">Changes saved.</span>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </div>
  );
};

export default AdminLeaderboardNotice;
