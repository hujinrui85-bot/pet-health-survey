export async function onRequestGet({ env }) {
  const existing = await env.PET_DATA.get('records_list');
  const records = existing ? JSON.parse(existing) : [];
  records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return new Response(JSON.stringify(records), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
