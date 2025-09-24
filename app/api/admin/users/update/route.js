import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { documentId, payload } = body;
    if (!documentId) return NextResponse.json({ error: 'documentId required' }, { status: 400 });

    const strapiUrl = process.env.STRAPI_API_URL || process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1338';
    const adminToken = process.env.STRAPI_ADMIN_TOKEN;
    if (!adminToken) return NextResponse.json({ error: 'Missing STRAPI_ADMIN_TOKEN on server' }, { status: 500 });

    // Find user by documentId
    const findRes = await fetch(`${strapiUrl}/api/users?filters[documentId][$eq]=${encodeURIComponent(documentId)}&pagination[limit]=1`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (!findRes.ok) {
      const text = await findRes.text();
      return NextResponse.json({ error: `Find failed: ${findRes.status} ${text}` }, { status: 500 });
    }

    const findJson = await findRes.json();
    // Support various response shapes returned by different Strapi setups
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

    const numericId = found?.id || found?.attributes?.id;
    if (!numericId) return NextResponse.json({ error: 'User not found (admin lookup)', debug: findJson }, { status: 404 });

    // Update user
    const updateRes = await fetch(`${strapiUrl}/api/users/${numericId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ data: payload })
    });

    const updateText = await updateRes.text();
    let updateJson = null;
    try { updateJson = JSON.parse(updateText); } catch (e) { /* ignore */ }

    if (!updateRes.ok) {
      return NextResponse.json({ error: `Update failed: ${updateRes.status}`, detail: updateText }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updateJson });

  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
