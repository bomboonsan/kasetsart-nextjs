import { NextResponse } from 'next/server';

// Resolve Strapi user numeric id from a documentId
// GET /api/admin/users/resolve-id?documentId=xxxx OR POST { documentId }
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const documentId = searchParams.get('documentId');
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
  return handleResolve(documentId, authHeader);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
    return handleResolve(body?.documentId, authHeader);
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}

async function handleResolve(documentId, authHeader) {
  if (!documentId) {
    return NextResponse.json({ error: 'documentId required' }, { status: 400 });
  }
  if (!authHeader) {
    return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
  }

  const strapiUrl = process.env.STRAPI_API_URL || process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1338';

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
  const numericId = found?.id || found?.attributes?.id;
  if (!numericId) return NextResponse.json({ error: 'User not found', debug: findJson }, { status: 404 });
  return NextResponse.json({ success: true, id: numericId });
}
