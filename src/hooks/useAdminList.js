"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAdminErrorMessage } from "@/lib/api/errors";

/**
 * Server-driven list state for admin tables: page, sort, search (debounced) and filters.
 * `fetcher(params)` must return { items, page, pageSize, totalCount }.
 * Stale responses are ignored, so quickly changing filters never shows out-of-date rows.
 */
export function useAdminList(fetcher, { pageSize = 20, initialFilters = {}, initialSort = null } = {}) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(initialSort);
  const [filters, setFilters] = useState(initialFilters);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [state, setState] = useState({ rows: [], totalCount: 0, loading: true, error: null });
  const [tick, setTick] = useState(0);
  const requestId = useRef(0);
  const fetcherRef = useRef(fetcher);

  // Keep the latest fetcher without re-running the fetch effect. Declared before it, so it runs first.
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQ(q.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    const current = ++requestId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcherRef
      .current({
        page,
        pageSize,
        q: debouncedQ || undefined,
        sort: sort?.key,
        dir: sort?.dir,
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "" && v != null)),
      })
      .then((res) => {
        if (current !== requestId.current) return;
        setState({ rows: res.items || [], totalCount: res.totalCount ?? 0, loading: false, error: null });
      })
      .catch((error) => {
        if (current !== requestId.current) return;
        setState({ rows: [], totalCount: 0, loading: false, error: getAdminErrorMessage(error) });
      });
  }, [page, pageSize, debouncedQ, sort, filters, tick]);

  const setFilter = useCallback((key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }, []);

  const reload = useCallback(() => setTick((n) => n + 1), []);

  return {
    ...state,
    page,
    pageSize,
    setPage,
    sort,
    setSort: (s) => {
      setSort(s);
      setPage(1);
    },
    q,
    setQ,
    filters,
    setFilter,
    reload,
  };
}
