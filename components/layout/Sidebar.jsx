"use client";

import React from "react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "@/utils/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from 'next-auth/react'
// import { useQuery, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { API_BASE } from '@/lib/api-base'
import {
	LayoutDashboard,
	UserPen,
	Files,
	ChartArea,
	UsersRound,
	File,
	FileUser,
} from "lucide-react";

let adminMenuItems = [];

const menuItems = [
	{
		id: "profile",
		url: "/profile",
		icon: <UserPen />,
		label: "โปรไฟล์ของฉัน",
		active: false,
	},
	{
		id: "form/all",
		url: "/form/all",
		icon: <FileUser />,
		label: "โครงการของฉัน",
		active: false,
	},
	{
		id: "dashboard/form/add",
		url: "#",
		icon: <Files />,
		label: "สร้างโครงการ",
		active: false,
		children: [
			{
				id: "project",
				url: "/form/create/project",
				icon: <File />,
				label: "ทุนโครงการวิจัย",
				active: false,
			},
			{
				id: "conference",
				url: "/form/create/conference",
				icon: <File />,
				label: "ประชุมวิชาการ",
				active: false,
			},
			{
				id: "publication",
				url: "/form/create/publication",
				icon: <File />,
				label: "ตีพิมพ์ทางวิชาการ",
				active: false,
			},
			{
				id: "funding",
				url: "/form/create/fund",
				icon: <File />,
				label: "ทุนตำรวจหรือหนังสือ",
				active: false,
			},
			{
				id: "book",
				url: "/form/create/book",
				icon: <File />,
				label: "หนังสือและตำรา",
				active: false,
			},
		],
	},
];
adminMenuItems = [
	{
		id: "dashbaord",
		url: "/dashboard",
		icon: <LayoutDashboard />,
		label: "แดชบอร์ด",
		active: false,
	},
	{
		id: "reports",
		url: "/report",
		icon: <ChartArea />,
		label: "ดูรายงาน",
		active: false,
	},
	{
		id: "admin/form/all",
		url: "/admin/form/all",
		icon: <FileUser />,
		label: "โครงการทั้งหมด",
		active: false,
	},
	{
		id: "dashboard/user/manage",
		url: "#",
		icon: <UsersRound />,
		label: "จัดการผู้ใช้",
		active: false,
		children: [
			{
				id: "admin/user",
				url: "/admin/user",
				icon: <UsersRound />,
				label: "รายชื่อผู้ใช้",
				active: false,
			},
			{
				id: "admin/user/add",
				url: "/admin/user/add",
				icon: <UsersRound />,
				label: "เพิ่มผู้ใช้",
				active: false,
			},
		],
	},
];


export default function Sidebar() {
	const [openGroups, setOpenGroups] = useState({});
	const { data: session, status } = useSession()

	const GET_USER_SUMMARY = gql`
		query GetUserSummary($documentId: ID!) {
			usersPermissionsUser(documentId: $documentId) {
				documentId
				firstNameEN
				lastNameEN
				firstNameTH
				lastNameTH
				academicPosition
				role { name documentId }
				avatar { url }
			}
		}
	`

	const documentId = session?.user?.documentId
	const { data: profileData, loading: profileLoading } = useQuery(GET_USER_SUMMARY, {
		skip: !documentId,
		variables: { documentId },
		context: {
			headers: {
				Authorization: session?.jwt ? `Bearer ${session.jwt}` : ''
			}
		}
	})

	const profile = profileData?.usersPermissionsUser

	const avatarUrl = (() => {
		const url = profile?.avatar?.url || null
		if (!url) return null
		return url.startsWith('http') ? url : `${API_BASE}${url}`
	})()

	const displayName = (() => {
		if (profile?.firstNameTH || profile?.lastNameTH) return `${profile?.firstNameTH || ''} ${profile?.lastNameTH || ''}`.trim()
		return session?.user?.name || session?.user?.email || ''
	})()

	const roleName = profile?.role?.name || profile?.academicPosition || ''
	const handleLogout = async (e) => {
		e.preventDefault();
		// call helper which uses next-auth signOut
		await signOut();
	};
	const toggleGroup = (id) => {
		setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	return (
		<aside className="w-64 p-4 border-r md:h-screen bg-white sticky top-0 flex flex-col justify-between">
			<section className="space-y-6">
				<div className="py-4 border-b border-gray-200">
					<div className="flex items-center space-x-2">
						<Image
							src="/Logo.png"
							alt="KU Logo"
							width={32}
							height={32}
							className="rounded"
							unoptimized
						/>
						<span className="font-bold text-2xl text-gray-800">Kasetsart</span>
					</div>
				</div>
				<nav className="mt-4 desktop-nav">
					<ul className="space-y-1 px-2">
						{menuItems.map((item) => (
							<li key={item.id}>
								{item.children ? (
									<div>
										<button
											onClick={() => toggleGroup(item.id)}
											aria-expanded={!!openGroups[item.id]}
											className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
												${item.active ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}
										>
											<span className="flex items-center gap-3">
												{item.icon}
												{item.label}
											</span>
											<svg
												className={`w-4 h-4 transform transition-transform ${openGroups[item.id] ? "rotate-90" : ""}`}
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 5l7 7-7 7"
												/>
											</svg>
										</button>

										{/* children links */}
										{openGroups[item.id] && (
											<ul className="mt-2 space-y-1 pl-8">
												{item.children.map((child) => (
													<li key={child.id}>
														<Link
															href={child.url ? child.url : "#"}
															className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100`}
														>
															{child.icon}
															{child.label}
														</Link>
													</li>
												))}
											</ul>
										)}
									</div>
								) : (
									<Link
										href={item.url ? item.url : "#"}
										className={`
											flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
											${item.active ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"}
										`}
									>
										{item.icon}
										{item.label}
									</Link>
								)}
							</li>
						))}
					</ul>
				</nav>
				<div className="px-6">
					<hr className="my-4 border-gray-200" />
				</div>
				{/* Admin Section */}
				<nav className="mt-4 desktop-nav">
					<ul className="space-y-1 px-2">
						{adminMenuItems.map((item) => (
							<li key={item.id}>
								{item.children ? (
									<div>
										<button
											onClick={() => toggleGroup(item.id)}
											aria-expanded={!!openGroups[item.id]}
											className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
												${item.active ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}
										>
											<span className="flex items-center gap-3">
												{item.icon}
												{item.label}
											</span>
											<svg
												className={`w-4 h-4 transform transition-transform ${openGroups[item.id] ? "rotate-90" : ""}`}
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 5l7 7-7 7"
												/>
											</svg>
										</button>

										{/* children links */}
										{openGroups[item.id] && (
											<ul className="mt-2 space-y-1 pl-8">
												{item.children.map((child) => (
													<li key={child.id}>
														<Link
															href={child.url ? child.url : "#"}
															className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100`}
														>
															{child.icon}
															{child.label}
														</Link>
													</li>
												))}
											</ul>
										)}
									</div>
								) : (
									<Link
										href={item.url ? item.url : "#"}
										className={`
											flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
											${item.active ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"}
										`}
									>
										{item.icon}
										{item.label}
									</Link>
								)}
							</li>
						))}
					</ul>
				</nav>
			</section>
			<section className="border-t border-gray-200 pt-4 space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						{/* <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
							{avatarUrl ? (
								<img
									src={avatarUrl}
									alt={displayName || userEmail}
									className="w-full h-full object-cover"
								/>
							) : (
								<span className="text-gray-600 font-semibold">
									{(displayName || userEmail || "?").slice(0, 1).toUpperCase()}
								</span>
							)}
						</div>
						<div>
							<div className="text-sm font-medium text-gray-900">
								{displayName || userEmail || ""}
							</div>
							<div className="text-xs text-gray-500">{role}</div>
						</div> */}


						{/* USER INFO */}
						<div className="flex items-center gap-3">
							{avatarUrl ? (
								<Image src={avatarUrl} alt={displayName || 'avatar'} width={40} height={40} className="rounded-full" unoptimized />
							) : (
								<div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
									{(displayName || '').slice(0, 1).toUpperCase()}
								</div>
							)}
							<div>
								<div className="text-sm font-medium text-gray-900">{displayName}</div>
								{roleName && <div className="text-xs text-gray-500">{roleName}</div>}
							</div>
						</div>
					</div>
				</div>
				<div className="mt-4">
					<Button className="w-full" variant="destructive" onClick={handleLogout}>ออกจากระบบ</Button>
				</div>
			</section>
		</aside>
	);
}
