export async function getHealth(): Promise<{ status: string }> {
  const res = await fetch("http://localhost:3000/api/health");
  return res.json();
}
