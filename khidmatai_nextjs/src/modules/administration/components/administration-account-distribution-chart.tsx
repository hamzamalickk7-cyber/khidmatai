"use client";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const chartColors = ["#166534", "#22c55e", "#60a5fa", "#f59e0b"];
export function AdministrationAccountDistributionChart({ data }: { data: Array<{ name: string; value: number }> }) {
  const populatedData = data.filter((item) => item.value > 0);
  if (!populatedData.length) return <div className="text-muted-foreground grid h-72 place-items-center rounded-xl border border-dashed text-sm">Account data will appear here.</div>;
  return <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={populatedData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={3}>{populatedData.map((item, index) => <Cell key={item.name} fill={chartColors[index % chartColors.length]}/>)}</Pie><Tooltip/><Legend verticalAlign="bottom" iconType="circle"/></PieChart></ResponsiveContainer></div>;
}
