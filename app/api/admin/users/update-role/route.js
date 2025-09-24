import { NextResponse } from 'next/server';

/*
 * Update a user's role (admin action)
 * Accepts body: { user: { id? | documentId? }, role: { id? } }
 * For performance & clarity we now require numeric role id (Strapi core roles: 1=user, 3=admin, 4=super admin in your setup).
 * We still allow user documentId lookup, but no longer resolve role by documentId.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { user = {}, role = {} } = body || {};
    if (!user.id && !user.documentId) {
      return NextResponse.json({ error: 'user.id or user.documentId required' }, { status: 400 });
    }
    if (!role.id) {
      return NextResponse.json({ error: 'role.id (numeric) required' }, { status: 400 });
    }
    const strapiUrl = process.env.STRAPI_API_URL || process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1338';
    const adminToken = process.env.STRAPI_ADMIN_TOKEN;
    if (!adminToken) return NextResponse.json({ error: 'Missing STRAPI_ADMIN_TOKEN on server' }, { status: 500 });

    // helper to resolve numeric id from documentId for users or roles
    async function resolveUser({ id, documentId }) {
      if (id) return id;
      const q = new URLSearchParams({ 'filters[documentId][$eq]': documentId, 'pagination[limit]': '1' });
      const res = await fetch(`${strapiUrl}/api/users?${q.toString()}`, { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error(`Resolve users failed: ${res.status}`);
      const json = await res.json();
      let found = null;
      if (Array.isArray(json) && json.length) found = json[0];
      else if (json?.data && Array.isArray(json.data) && json.data.length) found = json.data[0];
      else if (json?.data && !Array.isArray(json.data)) found = json.data;
      const numeric = found?.id || found?.attributes?.id;
      if (!numeric) throw new Error(`User not found for documentId=${documentId}`);
      return numeric;
    }

    const userId = await resolveUser(user);
    const roleId = role.id; // trust numeric id provided

    // Strapi expects direct field update for /users/:id with role id
    const updateRes = await fetch(`${strapiUrl}/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ role: roleId })
    });
    const text = await updateRes.text();
    let json = null; try { json = JSON.parse(text); } catch (e) {}
    if (!updateRes.ok) {
      return NextResponse.json({ error: 'Role update failed', status: updateRes.status, detail: text }, { status: 500 });
    }
    return NextResponse.json({ success: true, userId, roleId, data: json });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
