"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { ErrorState, Notice } from "@/components/ui/States";
import { Skeleton } from "@/components/ui/Skeleton";
import { getDashboardSummary } from "@/lib/api/reports.api";
import { getAdminErrorMessage } from "@/lib/api/errors";
import { formatDate, formatINR } from "@/lib/utils/format";

const DailyChart = dynamic(() => import("@/components/admin/DailyChart"), {
  ssr: false,
  loading: () => <Skeleton className="h-72 w-full" />,
});

function Stat({ label, value, href, hint }) {
  const body = (
    <div className="h-full rounded-[var(--radius-card)] border border-line bg-white p-4 shadow-sm transition-shadow hover:shadow-[var(--shadow-card)]">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold text-primary-900">{value ?? "—"}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}

export function DashboardView() {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    getDashboardSummary()
      .then((data) => alive && setState({ loading: false, data, error: null }))
      .catch((error) => alive && setState({ loading: false, data: null, error: getAdminErrorMessage(error) }));
    return () => {
      alive = false;
    };
  }, [tick]);

  const { loading, data, error } = state;

  if (error) {
    return (
      <>
        <AdminPageHeader title="Dashboard" />
        <ErrorState title="We could not load the dashboard" body={error} action={<Button variant="outline" onClick={() => setTick((n) => n + 1)}>Try again</Button>} />
      </>
    );
  }

  const chartRows = (data?.daily || []).map((d) => ({ ...d, label: formatDate(d.date, "en", { day: "numeric", month: "short" }) }));

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description={data ? `Figures for ${formatDate(data.date, "en")} (India time, IST).` : "Today at a glance."}
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="status" aria-label="Loading">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="New bookings today" value={data.todayBookings} href="/admin/bookings" />
            <Stat label="Arrivals today" value={data.arrivalsToday} href="/admin/bookings" />
            <Stat label="Pending" value={data.pending} href="/admin/bookings" />
            <Stat label="Confirmed" value={data.confirmed} href="/admin/bookings" />
            <Stat label="Checked in" value={data.checkedIn} href="/admin/bookings" />
            <Stat label="Checked out" value={data.checkedOut} href="/admin/bookings" />
            <Stat label="Enquiries today" value={data.todayEnquiries} href="/admin/enquiries" hint={`${data.newEnquiries ?? 0} unread in total`} />
            {/* Occupancy is shown only when the backend can compute it reliably */}
            <Stat
              label="Occupancy"
              value={typeof data.occupancyPercent === "number" ? `${data.occupancyPercent}%` : "Not available"}
              hint={typeof data.occupancyPercent === "number" ? undefined : "Shown once the backend reports it"}
            />
          </div>

          {data.month ? (
            <section className="mt-8" aria-labelledby="month-title">
              <h2 id="month-title" className="mb-3 text-lg font-semibold text-primary-900">
                This month
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Bookings" value={data.month.bookings} />
                {typeof data.month.revenue === "number" ? <Stat label="Payments received" value={formatINR(data.month.revenue)} /> : null}
              </div>
            </section>
          ) : null}

          {chartRows.length ? (
            <section className="mt-8 rounded-[var(--radius-card)] border border-line bg-white p-4" aria-labelledby="chart-title">
              <h2 id="chart-title" className="mb-3 text-lg font-semibold text-primary-900">
                Bookings per day
              </h2>
              <DailyChart
                rows={chartRows}
                bars={[
                  { key: "bookings", name: "Bookings", color: "#1d47a0" },
                  { key: "cancelled", name: "Cancelled", color: "#b42318" },
                ]}
              />
            </section>
          ) : (
            <Notice tone="info" className="mt-8">
              Charts will appear here once the backend supplies daily figures.
            </Notice>
          )}
        </>
      ) : null}
    </>
  );
}
