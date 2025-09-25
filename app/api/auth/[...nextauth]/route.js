// app/api/auth/[...nextauth]/route.js  หรือ  pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/** ใช้เรียก GraphQL โดยตรง หลีกเลี่ยง getClient()/getSession() เพื่อกันลูป */
const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_API_URL || "http://localhost:1338/graphql";

async function fetchGraphQL({ query, variables, jwt }) {
  const headers = { "Content-Type": "application/json" };
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  const resp = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`GraphQL HTTP ${resp.status}: ${text}`);
  }
  const json = await resp.json();
  console.debug("GraphQL response:", json);
  if (json.errors?.length) throw new Error(json.errors[0].message || "GraphQL error");
  return json.data;
}

/** ดึงโปรไฟล์หลังล็อกอินครั้งเดียว แล้วเก็บลง token */
async function hydrateProfile(jwt, documentId) {
  const PROFILE_Q = `
    query GetUserSummary($documentId: ID!) {
      usersPermissionsUser(documentId: $documentId) {
        documentId
        username
        email
        firstNameTH
        lastNameTH
        academicPosition
        role { name documentId }
        avatar { url }
      }
    }
  `;
  const data = await fetchGraphQL({
    query: PROFILE_Q,
    variables: { documentId },
    jwt,
  });
  const u = data?.usersPermissionsUser;
  if (!u) return {};

  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE || "http://localhost:1338";
  const raw = u.avatar?.url || null;
  const avatarUrl = raw ? (raw.startsWith("http") ? raw : `${apiBase}${raw}`) : null;

  const name =
    `${u.firstNameTH || ""} ${u.lastNameTH || ""}`.trim() || u.username || u.email || "";

  return {
    documentId: u.documentId || documentId,
    role: u.role ? { name: u.role.name, documentId: u.role.documentId } : null,
    academicPosition: u.academicPosition || null,
    avatarUrl,
    name,
    email: u.email || null,
  };
}

export const authOptions = {
  debug: process.env.NODE_ENV !== "production",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const LOGIN_MUT = `
            mutation ($identifier: String!, $password: String!) {
              login(input: { identifier: $identifier, password: $password }) {
                jwt
                user { id username email documentId }
              }
            }
          `;
          const data = await fetchGraphQL({
            query: LOGIN_MUT,
            variables: {
              identifier: credentials.email,
              password: credentials.password,
            },
          });
          const login = data?.login;
          if (!login) throw new Error("Invalid email or password");
          // ส่ง jwt+user กลับไปยัง jwt() callback
          return { ...login.user, jwt: login.jwt };
        } catch (err) {
          console.error("Login error:", err);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },

  callbacks: {
    /** รันทุกรีเควสฝั่งเซิร์ฟเวอร์ */
    async jwt({ token, user, trigger, session }) {
      // ครั้งแรกหลัง authorize
      if (user?.jwt) {
        token.id = user.id;
        token.jwt = user.jwt;
        token.documentId = user.documentId;

        // ดึงโปรไฟล์ครั้งเดียว แล้วฝังลง token
        try {
          const p = await hydrateProfile(user.jwt, user.documentId);
          token.documentId = p.documentId || token.documentId;
          token.role = p.role || null;
          token.avatar = p.avatar || null;
          token.name = p.name || token.name;
          token.email = p.email || token.email;
        } catch (e) {
          console.warn("Profile hydrate failed:", e.message);
        }
      }

      // อนุญาตอัปเดตบางฟิลด์จาก client โดยไม่ดึงใหม่
      if (trigger === "update" && session?.user) {
        if (session.user.role !== undefined) token.role = session.user.role;
        if (session.user.avatarUrl !== undefined) token.avatarUrl = session.user.avatarUrl;
        if (session.user.name !== undefined) token.name = session.user.name;
      }

      return token;
    },

    /** ส่งค่าลง session สำหรับ client ทุกหน้าใช้ได้ทันที */
    async session({ session, token }) {
      if (token) {
        session.jwt = token.jwt || null;
        session.user.id = token.id || null;
        session.user.documentId = token.documentId || null;
        session.user.role = token.role || null;                // ← ใช้ได้ทุกหน้า
        session.user.avatar = token.avatar || null;
        session.user.name = token.name || session.user.name || "";
        session.user.email = token.email || session.user.email || "";
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
