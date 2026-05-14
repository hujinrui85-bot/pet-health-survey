export async function onRequestPost({ request, env }) {
  const record = await request.json();
  record.id = crypto.randomUUID();
  record.createdAt = new Date().toISOString();

  let records = [];
  const existing = await env.PET_DATA.get('records_list');
  if (existing) records = JSON.parse(existing);
  records.push(record);
  await env.PET_DATA.put('records_list', JSON.stringify(records));

  return new Response(JSON.stringify({ ok: true, id: record.id, total: records.length }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
