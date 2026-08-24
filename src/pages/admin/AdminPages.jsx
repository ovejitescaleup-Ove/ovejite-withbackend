import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Save, Loader2, RefreshCw } from "lucide-react";

const PAGE_DEFINITIONS = [
  { slug: "home", label: "Home Page" },
  { slug: "about", label: "About Page" },
  { slug: "contact", label: "Contact Page" },
  { slug: "privacy", label: "Privacy Policy" },
  { slug: "terms", label: "Terms of Service" },
];

export default function AdminPages() {
  const [selected, setSelected] = useState("home");
  const [pages, setPages] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const current = useMemo(() => pages[selected] || { slug: selected, title: "", content: {} }, [pages, selected]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await base44.entities.Page.list("-updated_date", 100);
      const map = {};
      (rows || []).forEach((row) => { if (row.slug) map[row.slug] = row; });
      setPages(map);
    } catch (e) {
      setError(e.message || "Could not load pages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateCurrent = (patch) => {
    setPages((prev) => ({
      ...prev,
      [selected]: { ...(prev[selected] || { slug: selected }), ...patch },
    }));
  };

  const updateContent = (key, value) => {
    updateCurrent({ content: { ...(current.content || {}), [key]: value } });
  };

  const save = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        slug: selected,
        title: current.title || PAGE_DEFINITIONS.find((p) => p.slug === selected)?.label || selected,
        published: true,
        content: current.content || {},
      };
      if (current.id) await base44.entities.Page.update(current.id, payload);
      else await base44.entities.Page.create(payload);
      setMessage("Saved successfully. Refresh the public page to see CMS-connected fields.");
      await load();
    } catch (e) {
      setError(e.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Website Pages</h1>
          <p className="text-sm text-slate-500 mt-1">Edit page-level CMS content without changing the website code.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && <div className="mb-5 p-4 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}
      {message && <div className="mb-5 p-4 rounded-xl bg-green-50 text-green-700 text-sm">{message}</div>}

      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-3 h-fit">
          {PAGE_DEFINITIONS.map((page) => (
            <button
              key={page.slug}
              onClick={() => { setSelected(page.slug); setMessage(""); setError(""); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold mb-1 ${selected === page.slug ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {page.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Page Title</label>
            <input
              value={current.title || ""}
              onChange={(e) => updateCurrent({ title: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Content JSON</label>
            <textarea
              value={JSON.stringify(current.content || {}, null, 2)}
              onChange={(e) => {
                try { updateCurrent({ content: JSON.parse(e.target.value) }); setError(""); }
                catch { setError("The Content JSON is not valid JSON yet."); }
              }}
              rows={28}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-mono"
              spellCheck="false"
            />
            <p className="text-xs text-slate-400 mt-2">Keep the JSON valid. The existing website remains the fallback when a field is not supplied.</p>
          </div>

          <button disabled={saving} onClick={save} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Page"}
          </button>
        </div>
      </div>
    </div>
  );
}
