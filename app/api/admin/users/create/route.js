import { NextResponse } from 'next/server';

/*
 * Admin user create endpoint
 * Body: { payload: { username, email, password, ...profileFields } }
 * Uses STRAPI_ADMIN_TOKEN to call Strapi /api/users (admin context) which expects flat JSON.
 * Supports optional relations via numeric IDs arrays: academic_types, departments, faculties, organizations
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { payload } = body || {};
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'payload object required' }, { status: 400 });
    }
    if (!payload.email) return NextResponse.json({ error: 'email required' }, { status: 400 });
    if (!payload.username) payload.username = payload.email; // default username = email
    if (!payload.password) return NextResponse.json({ error: 'password required' }, { status: 400 });

    const strapiUrl = process.env.STRAPI_API_URL || process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1338';
    const adminToken = process.env.STRAPI_ADMIN_TOKEN;
    if (!adminToken) return NextResponse.json({ error: 'Missing STRAPI_ADMIN_TOKEN on server' }, { status: 500 });

    // Create user (Strapi expects direct fields, not wrapped in data)
    const createRes = await fetch(`${strapiUrl}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(payload)
    });
    const text = await createRes.text();
    let json = null; try { json = JSON.parse(text); } catch (e) {}
    if (!createRes.ok) {
      return NextResponse.json({ error: 'Create failed', status: createRes.status, detail: text }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: json });
  } catch (e) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}
