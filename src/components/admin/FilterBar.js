"use client";

import { Search } from "lucide-react";

/** Search box + any filter controls (children) in one responsive row. */
export function FilterBar({ q, onQChange, placeholder = "Search…", children }) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-[var(--radius-card)] border border-line bg-white p-3">
      <div className="min-w-48 flex-1">
        <label htmlFor="admin-search" className="mb-1 block text-xs font-medium text-muted">
          Search
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            id="admin-search"
            type="search"
            value={q}
            onChange={(e) => onQChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-11 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-base focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>
      </div>
      {children}
    </div>
  );
}

export function FilterSelect({ id, label, value, onChange, options }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 rounded-lg border border-line bg-white px-3 text-base focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FilterDate({ id, label, value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-muted">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 rounded-lg border border-line bg-white px-3 text-base focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
      />
    </div>
  );
}
