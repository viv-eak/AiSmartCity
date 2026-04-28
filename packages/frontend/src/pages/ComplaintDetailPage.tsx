import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getComplaint, getTimeline } from "../api/complaints";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: complaint, isLoading } = useQuery({
    queryKey: ["complaint", id],
    queryFn: () => getComplaint(id!),
    refetchInterval: 5000, // Poll for AI updates
  });

  const { data: timeline } = useQuery({
    queryKey: ["timeline", id],
    queryFn: () => getTimeline(id!),
    refetchInterval: 5000,
  });

  if (isLoading) return <p className="text-gray-500">Loading...</p>;
  if (!complaint) return <p className="text-red-500">Complaint not found</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-xl font-bold text-gray-900">
            Complaint #{complaint.id.slice(0, 8)}
          </h1>
          <StatusBadge status={complaint.status} />
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1 text-gray-900">{complaint.description}</p>
          </div>

          {complaint.summary && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                AI Summary
              </h3>
              <p className="mt-1 text-gray-900">{complaint.summary}</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Category</h3>
              <p className="mt-1 capitalize">
                {complaint.category?.replace("_", " ") || "Pending..."}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Priority</h3>
              <div className="mt-1">
                <PriorityBadge priority={complaint.priority} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                AI Confidence
              </h3>
              <p className="mt-1">
                {complaint.ai_confidence
                  ? `${(complaint.ai_confidence * 100).toFixed(0)}%`
                  : "Pending..."}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created</h3>
              <p className="mt-1 text-sm">
                {new Date(complaint.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {complaint.address && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Address</h3>
              <p className="mt-1">{complaint.address}</p>
            </div>
          )}

          {complaint.duplicate_of && (
            <div className="bg-yellow-50 p-3 rounded">
              <p className="text-sm text-yellow-800">
                This complaint was detected as a duplicate of{" "}
                <a
                  href={`/complaints/${complaint.duplicate_of}`}
                  className="underline"
                >
                  #{complaint.duplicate_of.slice(0, 8)}
                </a>
              </p>
            </div>
          )}
        </div>
      </div>

      {timeline && timeline.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Timeline</h2>
          <div className="space-y-4">
            {timeline.map(
              (event: {
                id: string;
                event_type: string;
                actor_name: string;
                created_at: string;
                metadata: Record<string, unknown>;
              }) => (
                <div
                  key={event.id}
                  className="flex items-start space-x-3 border-l-2 border-blue-200 pl-4"
                >
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {event.event_type.replace("_", " ")}
                    </p>
                    {event.actor_name && (
                      <p className="text-xs text-gray-500">
                        by {event.actor_name}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
