export async function onRequestPost({ request, env }) {
  const { id } = await request.json();
  const existing = await env.PET_DATA.get('records_list');
  let records = existing ? JSON.parse(existing) : [];
  const before = records.length;
  records = records.filter(r => r.id !== id);
  await env.PET_DATA.put('records_list', JSON.stringify(records));
  return new Response(JSON.stringify({ ok: true, deleted: before - records.length }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
