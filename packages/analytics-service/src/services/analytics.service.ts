import { getPool } from "@smart-city/shared";

export async function getSummary() {
  const pool = getPool();

  const [statusCounts, priorityCounts, totalResult] = await Promise.all([
    pool.query(
      `SELECT status, COUNT(*)::int as count FROM complaints GROUP BY status`
    ),
    pool.query(
      `SELECT priority, COUNT(*)::int as count FROM complaints WHERE priority IS NOT NULL GROUP BY priority`
    ),
    pool.query(`SELECT COUNT(*)::int as total FROM complaints`),
  ]);

  return {
    total: totalResult.rows[0].total,
    byStatus: Object.fromEntries(
      statusCounts.rows.map((r) => [r.status, r.count])
    ),
    byPriority: Object.fromEntries(
      priorityCounts.rows.map((r) => [r.priority, r.count])
    ),
  };
}

export async function getTrends(days: number) {
  const pool = getPool();

  const result = await pool.query(
    `SELECT DATE(created_at) as date, COUNT(*)::int as count
     FROM complaints
     WHERE created_at >= NOW() - INTERVAL '1 day' * $1
     GROUP BY DATE(created_at)
     ORDER BY date`,
    [days]
  );

  return result.rows;
}

export async function getCategoryBreakdown() {
  const pool = getPool();

  const result = await pool.query(
    `SELECT COALESCE(category, 'unclassified') as category, COUNT(*)::int as count
     FROM complaints
     GROUP BY category
     ORDER BY count DESC`
  );

  return result.rows;
}
