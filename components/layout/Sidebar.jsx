"use client";

import React, { useMemo, useState, useCallback, memo, createElement } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { signOut } from "@/utils/auth";
import { useSession } from "next-auth/react";
import { API_BASE } from "@/lib/api-base";
import {
	LayoutDashboard,
	UserPen,
	Files,
	ChartArea,
	UsersRound,
	File,
	FileUser,
	ChevronRight,
	Menu,
} from "lucide-react";

/** ---------- เมนูพื้นฐานเป็น “ข้อมูล” ไม่สร้าง element ล่วงหน้า ---------- */
const MAIN_ITEMS = [
	{ id: "profile", url: "/profile", icon: UserPen, label: "โปรไฟล์ของฉัน" },
	{ id: "form/all", url: "/form/all", icon: FileUser, label: "โครงการของฉัน" },
	{
		id: "dashboard/form/add",
		url: "#",
		icon: Files,
		label: "สร้างโครงการ",
		children: [
			{ id: "project", url: "/form/create/project", icon: File, label: "ทุนโครงการวิจัย" },
			{ id: "conference", url: "/form/create/conference", icon: File, label: "ประชุมวิชาการ" },
			{ id: "publication", url: "/form/create/publication", icon: File, label: "ตีพิมพ์ทางวิชาการ" },
			{ id: "funding", url: "/form/create/fund", icon: File, label: "ทุนตำราหรือหนังสือ" },
			{ id: "book", url: "/form/create/book", icon: File, label: "หนังสือและตำรา" },
		],
	},
];

const ADMIN_ITEMS = [
	{ id: "dashboard", url: "/dashboard", icon: LayoutDashboard, label: "แดชบอร์ด" },
	{ id: "reports", url: "/report", icon: ChartArea, label: "ดูรายงาน" },
	{ id: "admin/form/all", url: "/admin/form/all", icon: FileUser, label: "โครงการทั้งหมด" },
	{
		id: "dashboard/user/manage",
		url: "#",
		icon: UsersRound,
		label: "จัดการผู้ใช้",
		children: [
			{ id: "admin/user", url: "/admin/user", icon: UsersRound, label: "รายชื่อผู้ใช้" },
			{ id: "admin/user/add", url: "/admin/user/add", icon: UsersRound, label: "เพิ่มผู้ใช้" },
			{ id: "admin/user/add-admin", url: "/admin/user/add-admin", icon: UsersRound, label: "เพิ่มผู้ดูแลระบบ" },
		],
	},
];

const ADMIN_ONLY_ITEMS = [
	{ id: "profile", url: "/profile", icon: UserPen, label: "โปรไฟล์ของฉัน" },
	// { id: "dashboard", url: "/dashboard", icon: LayoutDashboard, label: "แดชบอร์ด" },
	// { id: "reports", url: "/report", icon: ChartArea, label: "ดูรายงาน" },
	{ id: "admin/form/all", url: "/admin/form/all", icon: FileUser, label: "โครงการทั้งหมด" },
	{
		id: "dashboard/user/manage",
		url: "#",
		icon: UsersRound,
		label: "จัดการผู้ใช้",
		children: [
			{ id: "admin/user", url: "/admin/user", icon: UsersRound, label: "รายชื่อผู้ใช้" },
		],
	},
];

/** ---------- Utilities ---------- */
function resolveAvatarUrl(raw) {
	if (!raw) return null;
	return raw.startsWith("http") ? raw : `${API_BASE}${raw}`;
}

/** ---------- MenuList (memo) ---------- */
// คอมโพเนนต์แสดงเมนูแบบ recursive ลด re-render ด้วย memo
const MenuList = memo(function MenuList({ items, open, onToggle }) {
	return (
		<ul className="space-y-1 px-2">
			{items.map((item) => {
				const Icon = item.icon;
				const hasChildren = Array.isArray(item.children) && item.children.length > 0;
				const isOpen = !!open[item.id];

				if (hasChildren) {
					return (
						<li key={item.id}>
							<button
								onClick={() => onToggle(item.id)}
								aria-expanded={isOpen}
								className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100"
							>
								<span className="flex items-center gap-3">
									{createElement(Icon, { size: 18 })}
									{item.label}
								</span>
								<ChevronRight
									className={`w-4 h-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
								/>
							</button>

							{isOpen && (
								<ul className="mt-2 space-y-1 pl-8">
									{item.children.map((child) => (
										<li key={child.id}>
											<Link
												href={child.url || "#"}
												className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100"
											>
												{createElement(child.icon, { size: 16 })}
												{child.label}
											</Link>
										</li>
									))}
								</ul>
							)}
						</li>
					);
				}

				return (
					<li key={item.id}>
						<Link
							href={item.url || "#"}
							className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100"
						>
							{createElement(Icon, { size: 18 })}
							{item.label}
						</Link>
					</li>
				);
			})}
		</ul>
	);
});

/** ---------- Sidebar ---------- */
export default function Sidebar() {
	const { data: session } = useSession();
	const [openGroups, setOpenGroups] = useState({});

	// ดึงจาก session ที่ถูกฝังมาจาก NextAuth callbacks
	const roleName = session?.user?.role?.name || session?.user?.academicPosition || "";
	const avatarUrl = useMemo(() => resolveAvatarUrl(session?.user?.avatarUrl || null), [session]);
	const displayName = useMemo(() => {
		const name = session?.user?.name || session?.user?.email || "";
		return name;
	}, [session]);

	// toggle กลุ่มเมนู
	const toggleGroup = useCallback((id) => {
		setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
	}, []);

	// เงื่อนไขแสดงเมนูแอดมินตาม role
	const showAdmin = useMemo(() => {
		if (!roleName) return false;
		const r = roleName.toLowerCase();
		return r.includes("admin") || r.includes("super admin")
	}, [roleName]);

	const showSuperAdmin = useMemo(() => {
		if (!roleName) return false;
		const r = roleName.toLowerCase();
		return r.includes("super admin")
	}, [roleName]);

	const showUser = useMemo(() => {
		if (!roleName) return false;
		const r = roleName.toLowerCase();
		return r.includes("user") || r.includes("super admin")
	}, [roleName]);

	const handleLogout = useCallback(async (e) => {
		e.preventDefault();
		await signOut();
	}, []);

	// Sidebar Content Component (reusable for both desktop and mobile)
	const SidebarContent = memo(function SidebarContent() {
		return (
			<>
				<section className="space-y-6">
					<div className="py-4 border-b border-gray-200">
						<div className="flex items-center space-x-2">
							<Image src="/Logo.png" alt="KU Logo" width={32} height={32} className="rounded" unoptimized />
							<span className="font-bold text-2xl text-gray-800">Kasetsart</span>
						</div>
					</div>

					{/* เมนูหลัก */}
					{showUser && (
						<nav className="mt-4">
							<MenuList items={MAIN_ITEMS} open={openGroups} onToggle={toggleGroup} />
						</nav>
					)}

					{showSuperAdmin && (<div className="px-6">
						<hr className="my-4 border-gray-200" />
					</div>)}

					{/* เมนูแอดมิน */}
					{showSuperAdmin && (
						<nav className="mt-4">
							<MenuList items={ADMIN_ITEMS} open={openGroups} onToggle={toggleGroup} />
						</nav>
					)}
					{showAdmin && !showSuperAdmin && (
						<nav className="mt-4">
							<MenuList items={ADMIN_ONLY_ITEMS} open={openGroups} onToggle={toggleGroup} />
						</nav>
					)}
				</section>

				<section className="border-t border-gray-200 pt-4 space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							{avatarUrl ? (
								<Image src={avatarUrl} alt={displayName || "avatar"} width={40} height={40} className="rounded-full" unoptimized />
							) : (
								<div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
									{(displayName || "?").slice(0, 1).toUpperCase()}
								</div>
							)}
							<div>
								<div className="text-sm font-medium text-gray-900">{displayName}</div>
								{roleName ? <div className="text-xs text-gray-500">{roleName}</div> : null}
							</div>
						</div>
					</div>
					<div className="mt-4">
						<Button className="w-full" variant="destructive" onClick={handleLogout}>
							ออกจากระบบ
						</Button>
					</div>
				</section>
			</>
		);
	});

	return (
		<>
			{/* Desktop Sidebar - ซ่อนใน mobile และ tablet */}
			<aside className="hidden lg:flex w-64 p-4 border-r md:h-screen bg-white sticky top-0 flex-col justify-between">
				<SidebarContent />
			</aside>

			{/* Mobile & Tablet Menu Button - แสดงเฉพาะใน mobile และ tablet */}
			<div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<Image src="/Logo.png" alt="KU Logo" width={28} height={28} className="rounded" unoptimized />
					<span className="font-bold text-xl text-gray-800">Kasetsart</span>
				</div>
				
				<Sheet>
					<SheetTrigger asChild>
						<Button variant="ghost" size="icon" className="lg:hidden">
							<Menu className="h-6 w-6" />
							<span className="sr-only">เปิดเมนู</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="w-64 p-4 flex flex-col justify-between">
						<SidebarContent />
					</SheetContent>
				</Sheet>
			</div>
		</>
	);
}
