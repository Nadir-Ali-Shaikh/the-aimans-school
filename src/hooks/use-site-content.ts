import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteContentRow = {
  id: string;
  page: string;
  section: string;
  field_key: string;
  label: string;
  field_type: "text" | "textarea" | "image" | "url";
  value: string | null;
  sort_order: number;
  hint: string | null;
};

export function useSiteContent(page: string) {
  const [rows, setRows] = useState<SiteContentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("site_content")
      .select("*")
      .in("page", [page, "global"])
      .order("sort_order")
      .then(({ data }) => {
        if (!active) return;
        setRows((data as SiteContentRow[]) || []);
        setLoading(false);
      });
    return () => { active = false; };
  }, [page]);

  const map = useMemo(() => {
    const m = new Map<string, string>();
    rows.forEach((r) => m.set(`${r.page}.${r.section}.${r.field_key}`, r.value || ""));
    return m;
  }, [rows]);

  const get = useCallback(
    (section: string, field_key: string, fallback = "") => {
      const v = map.get(`${page}.${section}.${field_key}`);
      if (v) return v;
      const g = map.get(`global.${section}.${field_key}`);
      return g || fallback;
    },
    [map, page],
  );

  return { get, loading, rows };
}
