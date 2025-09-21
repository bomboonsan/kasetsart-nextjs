"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "@/utils/auth";

export default function Sidebar() {
	const handleLogout = async (e) => {
		e.preventDefault();
		// call helper which uses next-auth signOut
		await signOut();
	};

	return (
		<aside className="w-64 p-4 border-r">
			<nav className="flex flex-col gap-2">
				<Link href="/">Home</Link>
				<Link href="/app/profile">Profile</Link>
				<div className="mt-4">
					<Button variant="ghost" onClick={handleLogout}>Logout</Button>
				</div>
			</nav>
		</aside>
	);
}
