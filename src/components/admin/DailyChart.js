"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Recharts is loaded only on screens that have real data to plot (dynamic import, no SSR).
// Colours are paired with a legend and axis labels so meaning never depends on colour alone.
export default function DailyChart({ rows, bars }) {
  return (
    <div className="h-72 w-full" role="img" aria-label="Chart of bookings per day">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dde3ee" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#4b5a75" />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#4b5a75" />
          <Tooltip />
          <Legend />
          {bars.map((bar) => (
            <Bar key={bar.key} dataKey={bar.key} name={bar.name} fill={bar.color} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
