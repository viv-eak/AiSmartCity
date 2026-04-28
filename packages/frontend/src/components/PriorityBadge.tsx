const priorityColors: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export default function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return <span className="text-xs text-gray-400">Pending</span>;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[priority] || "bg-gray-100 text-gray-800"}`}
    >
      {priority}
    </span>
  );
}
