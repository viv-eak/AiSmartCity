import client from "./client";

export async function createComplaint(data: {
  description: string;
  address?: string;
}) {
  const { data: result } = await client.post("/complaints", data);
  return result;
}

export async function getComplaints(params?: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
}) {
  const { data } = await client.get("/complaints", { params });
  return data;
}

export async function getComplaint(id: string) {
  const { data } = await client.get(`/complaints/${id}`);
  return data;
}

export async function getTimeline(id: string) {
  const { data } = await client.get(`/complaints/${id}/timeline`);
  return data;
}

export async function updateStatus(id: string, status: string) {
  const { data } = await client.patch(`/complaints/${id}/status`, { status });
  return data;
}
