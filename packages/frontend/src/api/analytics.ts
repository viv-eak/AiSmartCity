import client from "./client";

export async function getSummary() {
  const { data } = await client.get("/analytics/summary");
  return data;
}

export async function getTrends(days = 30) {
  const { data } = await client.get("/analytics/trends", { params: { days } });
  return data;
}

export async function getCategoryBreakdown() {
  const { data } = await client.get("/analytics/category-breakdown");
  return data;
}
