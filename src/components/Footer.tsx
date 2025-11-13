import { Facebook, Instagram, Youtube, Linkedin, Twitter, Globe, Bug, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { submitBugReport } from "@/lib/api";

export function Footer() {
  const [bugOpen, setBugOpen] = useState(false);
  const [bugTitle, setBugTitle] = useState("");
  const [bugDesc, setBugDesc] = useState("");
  const [bugEmail, setBugEmail] = useState("");
  const [bugSubmitting, setBugSubmitting] = useState(false);
  const [bugOk, setBugOk] = useState<string | null>(null);
  const [bugErr, setBugErr] = useState<string | null>(null);
  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      url: "https://facebook.com/PahasaraUCSC",
      color: "hover:text-blue-500"
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://www.instagram.com/ucscmedia",
      color: "hover:text-pink-500"
    },
    {
      name: "YouTube",
      icon: Youtube,
      url: "https://www.youtube.com/@pahasaraucsc",
      color: "hover:text-red-500"
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: "https://www.linkedin.com/company/ucscmedia",
      color: "hover:text-blue-400"
    },
    { 
      name: "Twitter", 
      icon: Twitter, 
      url: "https://twitter.com/pahasaraucsc",
      color: "hover:text-sky-400"
    },
    { 
      name: "Website", 
      icon: Globe, 
      url: "https://pahasara.ucsc.lk",
      color: "hover:text-green-400"
    }
  ];

  return (
    <footer className="border-t border-red-900/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">

        {/* Report a bug CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <div className="text-center sm:text-left">
            <h3 className="text-white font-bold">Spot an issue?</h3>
            <p className="text-gray-400 text-sm">Help us fix it by reporting the bug.</p>
          </div>
          <Button onClick={() => setBugOpen(true)} className="bg-red-600 hover:bg-red-500">
            <Bug className="w-4 h-4 mr-2" /> Report a bug
          </Button>
        </div>

        {/* Social Media Links */}
        <div className="pt-4">
          <h3 className="text-white font-bold text-center mb-4">
            Follow Pahasara Media Unit
          </h3>
          <div className="flex justify-center items-center gap-4 md:gap-6 flex-wrap">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-400 ${social.color} transition-colors duration-300 transform hover:scale-110`}
                  aria-label={social.name}
                >
                  <Icon className="w-6 h-6 md:w-7 md:h-7" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 pt-6 border-t border-red-900/30">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Pahasara | UCSC Media. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Updating and Developing Body
          </p>
          <p className="text-gray-600 text-xs mt-1">
            #PAHASARAUCSC
          </p>
        </div>
      </div>

      {/* Bug Report Modal */}
      {bugOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setBugOpen(false)}></div>
          <div className="relative w-full max-w-lg mx-auto bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-6 z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bug className="w-5 h-5 text-red-400" />
                <h3 className="text-white font-semibold">Report a bug</h3>
              </div>
              <button className="text-gray-400 hover:text-white" onClick={() => setBugOpen(false)} aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBugErr(null); setBugOk(null);
                if (!bugTitle.trim() || !bugDesc.trim()) { setBugErr('Please provide a title and description.'); return; }
                setBugSubmitting(true);
                try {
                  await submitBugReport({
                    title: bugTitle.trim(),
                    description: bugDesc.trim(),
                    page_url: typeof window !== 'undefined' ? window.location.href : '',
                    contact: bugEmail.trim() || null,
                    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                  });
                  setBugOk('Thanks! Your report has been submitted.');
                  setBugTitle(''); setBugDesc(''); setBugEmail('');
                  setTimeout(() => setBugOpen(false), 1000);
                } catch (err: any) {
                  setBugErr(err?.message || 'Failed to submit bug report.');
                } finally {
                  setBugSubmitting(false);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs text-gray-500 mb-1">Title</label>
                <input
                  className="w-full bg-black border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder:text-zinc-500 caret-white"
                  placeholder="Short summary"
                  value={bugTitle}
                  onChange={(e) => setBugTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Description</label>
                <textarea
                  rows={4}
                  className="w-full bg-black border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder:text-zinc-500 caret-white"
                  placeholder="What happened? Steps to reproduce?"
                  value={bugDesc}
                  onChange={(e) => setBugDesc(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Page URL</label>
                  <input
                    className="w-full bg-black border border-zinc-700 rounded-md px-3 py-2 text-sm text-gray-300"
                    value={typeof window !== 'undefined' ? window.location.href : ''}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Contact (optional)</label>
                  <input
                    className="w-full bg-black border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder:text-zinc-500 caret-white"
                    placeholder="Email or phone"
                    value={bugEmail}
                    onChange={(e) => setBugEmail(e.target.value)}
                  />
                </div>
              </div>
              {bugErr && <div className="text-red-400 text-sm">{bugErr}</div>}
              {bugOk && <div className="text-green-400 text-sm">{bugOk}</div>}
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" className="border-zinc-700" onClick={() => setBugOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={bugSubmitting} className="bg-red-600 hover:bg-red-500">
                  {bugSubmitting ? 'Submitting…' : 'Submit'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
}
