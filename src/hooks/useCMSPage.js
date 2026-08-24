import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export function useCMSPage(pageKey, fallback = {}) {
  const [content, setContent] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await base44.entities.SitePage.filter({ page_key: pageKey, published: true }, "-updated_date", 1);
        if (mounted && rows?.[0]) setContent({ ...fallback, ...rows[0] });
      } catch (e) {
        // Keep the built-in fallback if Supabase is unavailable.
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [pageKey]);

  return { content, loading };
}

export const parseJSON = (value, fallback = []) => {
  if (Array.isArray(value)) return value;
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};
