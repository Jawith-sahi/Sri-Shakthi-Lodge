"use client";

import { useCallback, useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FilterDate, FilterSelect } from "@/components/admin/FilterBar";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Notice } from "@/components/ui/States";
import { getAdminErrorMessage } from "@/lib/api/errors";
import { saveBlob } from "@/lib/api/client";
import { exportReport, getDailyReport, getEnquiryReport, getMonthlyReport, getOccupancyReport } from "@/lib/api/reports.api";
import { addDaysISO, formatDate, formatINR, todayIST } from "@/lib/utils/format";

const REPORTS = {
  daily: {
    label: "Daily bookings",
    load: getDailyReport,
    columns: [
      { key: "date", header: "Date", primary: true, render: (r) => formatDate(r.date, "en") },
      { key: "bookings", header: "Bookings" },
      { key: "confirmed", header: "Confirmed" },
      { key: "cancelled", header: "Cancelled" },
      { key: "revenue", header: "Amount received", render: (r) => formatINR(r.revenue) },
    ],
    rowKey: "date",
  },
  monthly: {
    label: "Monthly bookings",
    load: getMonthlyReport,
    columns: [
      { key: "month", header: "Month", primary: true },
      { key: "bookings", header: "Bookings" },
      { key: "confirmed", header: "Confirmed" },
      { key: "cancelled", header: "Cancelled" },
      { key: "revenue", header: "Amount received", render: (r) => formatINR(r.revenue) },
    ],
    rowKey: "month",
  },
  occupancy: {
    label: "Occupancy",
    load: getOccupancyReport,
    columns: [
      { key: "date", header: "Date", primary: true, render: (r) => formatDate(r.date, "en") },
      { key: "occupiedRooms", header: "Rooms occupied" },
      { key: "availableRooms", header: "Rooms available" },
      { key: "occupancyPercent", header: "Occupancy", render: (r) => (r.occupancyPercent == null ? "—" : `${r.occupancyPercent}%`) },
    ],
    rowKey: "date",
  },
  enquiries: {
    label: "Enquiries",
    load: getEnquiryReport,
    columns: [
      { key: "date", header: "Date", primary: true, render: (r) => formatDate(r.date, "en") },
      { key: "total", header: "Received" },
      { key: "resolved", header: "Resolved" },
    ],
    rowKey: "date",
  },
};

export function ReportsView() {
  const today = todayIST();
  const [type, setType] = useState("daily");
  const [from, setFrom] = useState(addDaysISO(today, -29));
  const [to, setTo] = useState(today);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState("");

  const report = REPORTS[type];
  const rangeInvalid = !from || !to || from > to;

  const run = useCallback(
    async (signal) => {
      if (rangeInvalid) return;
      setLoading(true);
      setError(null);
      try {
        const res = await REPORTS[type].load({ from, to });
        if (signal?.cancelled) return;
        setRows(res?.rows || []);
      } catch (e) {
        if (!signal?.cancelled) setError(getAdminErrorMessage(e));
      } finally {
        if (!signal?.cancelled) setLoading(false);
      }
    },
    [type, from, to, rangeInvalid]
  );

  useEffect(() => {
    const signal = { cancelled: false };
    run(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [run]);

  const doExport = async (format) => {
    setExporting(format);
    try {
      const { blob, filename } = await exportReport({ type, from, to, format });
      saveBlob(blob, filename || `${type}-${from}-to-${to}.${format}`);
    } catch (e) {
      toast.error(getAdminErrorMessage(e));
    } finally {
      setExporting("");
    }
  };

  return (
    <div>
      <AdminPageHeader title="Reports" description="Figures are calculated by the server. Dates are in Indian Standard Time." />
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-[var(--radius-card)] border border-line bg-white p-3">
        <FilterSelect id="report-type" label="Report" value={type} onChange={setType} options={Object.entries(REPORTS).map(([value, r]) => ({ value, label: r.label }))} />
        <FilterDate id="report-from" label="From" value={from} onChange={setFrom} />
        <FilterDate id="report-to" label="To" value={to} onChange={setTo} />
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => doExport("csv")} loading={exporting === "csv"} disabled={rangeInvalid || Boolean(exporting)}>
            <Download className="h-4 w-4" aria-hidden="true" /> CSV
          </Button>
          <Button variant="outline" onClick={() => doExport("xlsx")} loading={exporting === "xlsx"} disabled={rangeInvalid || Boolean(exporting)}>
            <Download className="h-4 w-4" aria-hidden="true" /> Excel
          </Button>
        </div>
      </div>
      {rangeInvalid ? <Notice tone="warning" className="mb-4">Choose a start date that is on or before the end date.</Notice> : null}
      <DataTable
        caption={report.label}
        columns={report.columns}
        rows={rows}
        rowKey={report.rowKey}
        loading={loading}
        error={error}
        onRetry={() => run()}
        emptyTitle="No data for these dates"
        emptyBody="Try a wider date range."
      />
    </div>
  );
}
