import { NextResponse } from 'next/server';

/*
 * Admin user update endpoint
 * Accepts either:
 *  - { id: <numericId>, payload: {...} }
 *  - { documentId: <uuid/uid>, payload: {...} }
 * If id is provided it will be used directly (faster, no lookup)
 * If only documentId is provided we will lookup numeric id first.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { id, documentId, payload } = body || {};

    if (!id && !documentId) {
      return NextResponse.json({ error: 'id or documentId required' }, { status: 400 });
    }
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'payload object required' }, { status: 400 });
    }

  const strapiUrl = process.env.STRAPI_API_URL || process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1338';
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });

    let numericId = id; // trust caller if provided (must be number or numeric string)
    if (numericId && !/^\d+$/.test(String(numericId))) {
      return NextResponse.json({ error: 'id must be numeric' }, { status: 400 });
    }

    // Lookup if id not directly provided
    if (!numericId) {
      const findRes = await fetch(`${strapiUrl}/api/users?filters[documentId][$eq]=${encodeURIComponent(documentId)}&pagination[limit]=1`, {
        headers: { Authorization: authHeader }
      });
      if (!findRes.ok) {
        const text = await findRes.text();
        return NextResponse.json({ error: `Find failed: ${findRes.status} ${text}` }, { status: 500 });
      }
      const findJson = await findRes.json();
      let found = null;
      if (Array.isArray(findJson) && findJson.length > 0) {
        found = findJson[0];
      } else if (findJson?.data && Array.isArray(findJson.data) && findJson.data.length > 0) {
        found = findJson.data[0];
      } else if (findJson?.data && !Array.isArray(findJson.data) && findJson.data) {
        found = findJson.data;
      } else if (findJson?.users && Array.isArray(findJson.users) && findJson.users.length > 0) {
        found = findJson.users[0];
      } else if (findJson?.users?.data && Array.isArray(findJson.users.data) && findJson.users.data.length > 0) {
        found = findJson.users.data[0];
      }
      numericId = found?.id || found?.attributes?.id;
      if (!numericId) return NextResponse.json({ error: 'User not found (admin lookup)', debug: findJson }, { status: 404 });
    }

    // Perform update (Strapi Users update expects flat fields, not wrapped in data when using /api/users/:id in admin context)
    const updateRes = await fetch(`${strapiUrl}/api/users/${numericId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader
      },
      body: JSON.stringify(payload)
    });

    const updateText = await updateRes.text();
    let updateJson = null;
    try { updateJson = JSON.parse(updateText); } catch (e) { /* ignore parse error */ }

    if (!updateRes.ok) {
      return NextResponse.json({ error: `Update failed: ${updateRes.status}`, detail: updateText }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: numericId, data: updateJson });
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
