"use client";

import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useSession } from 'next-auth/react';
import { GET_FUNDS, GET_MY_FUNDS } from '@/graphql/formQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, FileText, X } from 'lucide-react';

export default function FundPicker({ label = 'ทุนที่เกี่ยวข้อง', onSelect, selectedFund, required = false }) {
	const { data: session } = useSession();
	const [searchOpen, setSearchOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [funds, setFunds] = useState([]);

	// ตรวจสอบ role ของ user
	const isUserRole = session?.user?.role?.name?.toLowerCase() === 'user';
	const userId = session?.user?.documentId || session?.user?.id;

	// เลือก query ตาม role
	const queryToUse = isUserRole ? GET_MY_FUNDS : GET_FUNDS;
	const queryVariables = {
		pagination: { pageSize: 100 },
		filters: searchTerm ? {
			or: [
				{ fundTypeText: { containsi: searchTerm } },
				{ fundType: { containsi: searchTerm } },
				{ duration: { containsi: searchTerm } },
				{ pages: { containsi: searchTerm } },
				{ partners: { containsi: searchTerm } },
				{ contentDesc: { containsi: searchTerm } },
			]
		} : {},
		...(isUserRole && userId ? { userId } : {})
	};

	const { data: fundsData, loading, error } = useQuery(queryToUse, {
		variables: queryVariables,
		skip: !searchOpen,
		context: {
			headers: {
				Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ''
			}
		},
		ssr: false
	});

	useEffect(() => {
		const returned = fundsData?.funds;
		if (Array.isArray(returned)) {
			const mapped = returned.map(f => ({
				id: f.documentId || f.id,
				documentId: f.documentId || f.id,
				contentDesc: f.contentDesc,
				fundType: f.fundType,
				fundTypeText: f.fundTypeText,
				duration: f.duration,
				pages: f.pages,
				partners: f.partners,
				updatedAt: f.updatedAt,
			}));
			setFunds(mapped);
		} else {
			setFunds([]);
		}
	}, [fundsData]);

	const handleFundSelect = (fund) => {
		onSelect && onSelect(fund);
		setSearchOpen(false);
		setSearchTerm('');
	};

	const clearSelection = () => {
		onSelect && onSelect(null);
	};

	const formatFundDisplay = (fund) => {
		return fund.contentDesc || `Fund #${fund.id}`;
	};

	const formatFundDetails = (fund) => {
		const details = [];
		if (fund.duration) details.push(`ระยะเวลา: ${fund.duration}`);
		if (fund.pages) details.push(`หน้า: ${fund.pages}`);
		return details.join(' • ');
	};

	return (
		<div className="space-y-1 flex items-center">
			<div className="w-1/3">
				<Label className="text-sm font-medium text-gray-700">
					{label} {required && <span className="text-red-500 ml-1">*</span>}
				</Label>
			</div>
			<div className="flex-1 space-x-3">
				{selectedFund ? (
					<div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
						<FileText className="w-5 h-5 text-gray-600" />
						<div className="flex-1">
							<div className="text-sm font-medium text-gray-900">
								{formatFundDisplay(selectedFund)}
							</div>
							{formatFundDetails(selectedFund) && (
								<div className="text-xs text-gray-600">{formatFundDetails(selectedFund)}</div>
							)}
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={clearSelection}
							className="text-gray-400 hover:text-gray-600"
						>
							<X className="w-4 h-4" />
						</Button>
					</div>
				) : (
					<Dialog open={searchOpen} onOpenChange={setSearchOpen}>
						<DialogTrigger asChild>
							<Button variant="outline" className="w-full justify-start text-gray-500">
								<Search className="w-4 h-4 mr-2" />
								คลิกเพื่อเลือกทุน
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<DialogTitle>เลือกทุน</DialogTitle>
								<DialogDescription>ค้นหาและเลือกทุนจากระบบ</DialogDescription>
							</DialogHeader>
							<div className="space-y-4">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
									<Input
										placeholder="ค้นหาด้วยชื่อประเภททุน หรือระยะเวลา..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-10"
									/>
								</div>
								<div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
									{loading && (
										<div className="p-4 text-center text-gray-500">กำลังโหลด...</div>
									)}
									{error && (
										<div className="p-4 text-center text-red-500">เกิดข้อผิดพลาด: {error.message}</div>
									)}
									{!loading && !error && funds.length === 0 && (
										<div className="p-4 text-center text-gray-500">ไม่พบทุน</div>
									)}
									{!loading && !error && funds.map((fund) => (
										<div
											key={fund.documentId}
											className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
											onClick={() => handleFundSelect(fund)}
										>
											<div className="flex items-start gap-3">
												<FileText className="w-5 h-5 text-gray-400 mt-0.5" />
												<div className="flex-1">
													<div className="text-sm font-medium text-gray-900">
														{formatFundDisplay(fund)}
													</div>
													{formatFundDetails(fund) && (
														<div className="text-xs text-gray-600">{formatFundDetails(fund)}</div>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</DialogContent>
					</Dialog>
				)}
			</div>
		</div>
	);
}

