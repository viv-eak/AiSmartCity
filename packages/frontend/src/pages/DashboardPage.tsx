import { useQuery } from "@tanstack/react-query";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getSummary, getCategoryBreakdown, getTrends } from "../api/analytics";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

export default function DashboardPage() {
  const { data: summary } = useQuery({
    queryKey: ["summary"],
    queryFn: getSummary,
  });
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoryBreakdown,
  });
  const { data: trends } = useQuery({
    queryKey: ["trends"],
    queryFn: () => getTrends(30),
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total Complaints</p>
            <p className="text-3xl font-bold">{summary.total}</p>
          </div>
          {Object.entries(summary.byStatus as Record<string, number>).map(
            ([status, count]) => (
              <div key={status} className="bg-white p-6 rounded-lg shadow">
                <p className="text-sm text-gray-500 capitalize">
                  {status.replace("_", " ")}
                </p>
                <p className="text-3xl font-bold">{count}</p>
              </div>
            )
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories && categories.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">By Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ category, count }) => `${category}: ${count}`}
                >
                  {categories.map((_: unknown, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {trends && trends.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">
              Complaints (Last 30 Days)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trends}>
                <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
