"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
export function AdministrationProviderStatusChart({ data }: { data: Array<{ status: string; count: number }> }) {
  if (!data.length)
    return (
      <div className="text-muted-foreground grid h-64 place-items-center rounded-xl border border-dashed text-sm">
        Provider activity will appear here.
      </div>
    );
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -20, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="status" tickFormatter={(value) => String(value).replaceAll("_", " ")} fontSize={11} />
          <YAxis allowDecimals={false} fontSize={11} />
          <Tooltip />
          <Bar dataKey="count" fill="#166534" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
