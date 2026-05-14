export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json; charset=utf-8'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    try {
      // === Save record ===
      if (path === '/api/save' && request.method === 'POST') {
        const record = await request.json();
        record.id = crypto.randomUUID();
        record.createdAt = new Date().toISOString();

        let records = [];
        const existing = await env.PET_DATA.get('records_list');
        if (existing) {
          records = JSON.parse(existing);
        }
        records.push(record);
        await env.PET_DATA.put('records_list', JSON.stringify(records));

        return new Response(JSON.stringify({ ok: true, id: record.id, total: records.length }), { headers });
      }

      // === Get all records ===
      if (path === '/api/records' && request.method === 'GET') {
        const existing = await env.PET_DATA.get('records_list');
        const records = existing ? JSON.parse(existing) : [];
        records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return new Response(JSON.stringify(records), { headers });
      }

      // === Delete record ===
      if (path === '/api/delete' && request.method === 'POST') {
        const { id } = await request.json();
        const existing = await env.PET_DATA.get('records_list');
        let records = existing ? JSON.parse(existing) : [];
        const before = records.length;
        records = records.filter(r => r.id !== id);
        await env.PET_DATA.put('records_list', JSON.stringify(records));
        return new Response(JSON.stringify({ ok: true, deleted: before - records.length }), { headers });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }
};
