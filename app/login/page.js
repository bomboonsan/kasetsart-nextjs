
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result.error) {
      setError(result.error);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div>
            <Image
                src="/Logo.png"
                alt="KU Logo"
                width={150}
                height={150}
                className="mb-4 mx-auto"
                unoptimized
            />
        </div>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div>
                  <label htmlFor="email">อีเมลหรือชื่อผู้ใช้</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 text-gray-700 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
        <div>
                  <label htmlFor="password">รหัสผ่าน</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 text-gray-700 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
        <button type="submit" className="w-full py-2 font-bold text-white bg-primary rounded-md hover:bg-primary-action focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          เข้าสู่ระบบ
        </button>
      </form>
    </div>
  );
}
