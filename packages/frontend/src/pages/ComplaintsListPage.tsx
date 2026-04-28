import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getComplaints } from "../api/complaints";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";

export default function ComplaintsListPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["complaints", page, status, category],
    queryFn: () =>
      getComplaints({
        page,
        limit: 20,
        status: status || undefined,
        category: category || undefined,
      }),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
        <Link
          to="/complaints/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          New Complaint
        </Link>
      </div>

      <div className="flex space-x-4">
        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="classified">Classified</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
          <option value="duplicate">Duplicate</option>
        </select>
        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Categories</option>
          <option value="roads">Roads</option>
          <option value="water_supply">Water Supply</option>
          <option value="electricity">Electricity</option>
          <option value="sanitation">Sanitation</option>
          <option value="public_safety">Public Safety</option>
          <option value="parks">Parks</option>
          <option value="noise">Noise</option>
          <option value="other">Other</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.data?.map(
                  (c: {
                    id: string;
                    summary: string;
                    description: string;
                    category: string;
                    priority: string;
                    status: string;
                    created_at: string;
                  }) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link
                          to={`/complaints/${c.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {c.summary || c.description.slice(0, 80)}...
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm capitalize">
                        {c.category?.replace("_", " ") || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {data?.pagination && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Total: {data.pagination.total}
              </p>
              <div className="space-x-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm">Page {page}</span>
                <button
                  disabled={
                    page * data.pagination.limit >= data.pagination.total
                  }
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
