"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery } from '@apollo/client/react';
import Block from '../layout/Block';
import FormTextarea from '@/components/myui/FormTextarea';
import FormRadio from '@/components/myui/FormRadio';
import FormInput from '@/components/myui/FormInput';
import FormSelect from '../myui/FormSelect';
import FileUploadField from './FileUploadField';
import Partners from './Partners';
import FundPicker from './FundPicker';
import { Button } from '@/components/ui/button';
import { BOOK_FORM_INITIAL } from '@/data/book';
import { CREATE_BOOK, UPDATE_BOOK, GET_BOOK, UPDATE_FUND_PARTNERS } from '@/graphql/formQueries';
import { extractInternalUserIds, normalizeDocumentId } from '@/utils/partners';
import toast from 'react-hot-toast';

// Helper functions moved outside component to prevent recreation
const hydrateBook = (b) => ({
	...BOOK_FORM_INITIAL,
	...b,
	publicationDate: b.publicationDate ? String(b.publicationDate).slice(0, 10) : '',
	__fundingObj: b.funds?.[0] ? b.funds[0] : null,
	attachments: b.attachments || [],
	partners: b.partners || [],
	writers: Array.isArray(b.writers) ? b.writers : [],
});

const extractAttachmentIds = (arr) => {
	if (!Array.isArray(arr)) return [];
	return arr
		.filter(a => a && (a.documentId || a.id))
		.map(a => Number(a.documentId ?? a.id))
		.filter(n => Number.isFinite(n) && n > 0);
};

// Writers editor component moved outside and memoized
const WritersEditor = React.memo(function WritersEditor({ writers, onChange }) {
	const addWriter = useCallback(() => {
		onChange([...(writers || []), { name: '', email: '', affiliation: '' }]);
	}, [writers, onChange]);

	const updateWriter = useCallback((idx, field, value) => {
		const next = [...writers];
		next[idx] = { ...next[idx], [field]: value };
		onChange(next);
	}, [writers, onChange]);

	const removeWriter = useCallback((idx) => {
		onChange((writers || []).filter((_, i) => i !== idx));
	}, [writers, onChange]);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="text-sm font-medium text-gray-700">ผู้เขียน (Writers)</div>
				<Button size="sm" type="button" onClick={addWriter}>เพิ่มผู้เขียน</Button>
			</div>
			<div className="space-y-3">
				{(writers || []).map((w, i) => (
					<div key={i} className="grid grid-cols-12 gap-3 p-3 border rounded-md bg-gray-50">
						<div className="col-span-3">
							<FormInput label="ชื่อ" value={w.name || ''} onChange={(e) => updateWriter(i, 'name', e.target.value)} />
						</div>
						<div className="col-span-4">
							<FormInput label="อีเมล" value={w.email || ''} onChange={(e) => updateWriter(i, 'email', e.target.value)} />
						</div>
						<div className="col-span-4">
							<FormInput label="สังกัด" value={w.affiliation || ''} onChange={(e) => updateWriter(i, 'affiliation', e.target.value)} />
						</div>
						<div className="col-span-1 flex items-start pt-6">
							<Button variant="ghost" size="sm" type="button" onClick={() => removeWriter(i)}>ลบ</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
});

export default function BookForm({ documentId, isEdit = false, onSubmit, initialData = null }) {
	const router = useRouter();
	const { data: session } = useSession();
	const [formData, setFormData] = useState(BOOK_FORM_INITIAL);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const originalAttachmentIdsRef = useRef([]);

	// Memoize authorization header
	const authHeaders = useMemo(() => ({
		headers: { Authorization: session?.jwt ? `Bearer ${session.jwt}` : '' }
	}), [session?.jwt]);

	// If editing and initialData not provided, fetch existing book
	const shouldFetch = isEdit && !initialData && documentId;
	const { data: existingBookData } = useQuery(GET_BOOK, {
		variables: { documentId },
		skip: !shouldFetch,
		context: authHeaders,
		onCompleted: useCallback((data) => {
			const b = data?.book;
			if (!b) return;
			const hydrated = hydrateBook(b);
			setFormData(hydrated);
			originalAttachmentIdsRef.current = extractAttachmentIds(hydrated.attachments);
		}, [])
	});

	// If initialData provided, use it to hydrate form once
	useEffect(() => {
		if (!initialData) return;
		const hydrated = hydrateBook(initialData);
		setFormData(hydrated);
		originalAttachmentIdsRef.current = extractAttachmentIds(hydrated.attachments);
	}, [initialData]);

	const [createBook] = useMutation(CREATE_BOOK, {
		context: authHeaders
	});
	const [updateBook] = useMutation(UPDATE_BOOK, {
		context: authHeaders
	});
	const [updateFundPartners] = useMutation(UPDATE_FUND_PARTNERS, {
		context: authHeaders
	});

	const handleInputChange = useCallback((field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	}, []);

	const handleSubmit = useCallback(async () => {
		if (!session?.jwt) {
			toast.error('กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล');
			return;
		}
		if (!formData.titleTH.trim() && !formData.titleEN.trim()) {
			toast.error('กรุณากรอกชื่อผลงานอย่างน้อย 1 ภาษา');
			return;
		}
		setIsSubmitting(true);
		try {
			const attachmentIds = extractAttachmentIds(formData.attachments);
			const currentIdsSorted = [...attachmentIds].sort();
			const originalIdsSorted = [...originalAttachmentIdsRef.current].sort();
			const attachmentsChanged = JSON.stringify(currentIdsSorted) !== JSON.stringify(originalIdsSorted);

			const fundDocumentId = normalizeDocumentId(formData.__fundingObj?.documentId ?? formData.__fundingObj?.id);

			const bookData = {
				bookType: formData.bookType ?? "0",
				titleTH: formData.titleTH?.trim() || null,
				titleEN: formData.titleEN?.trim() || null,
				detail: formData.detail?.trim() || null,
				level: formData.level === '' ? null : formData.level,
				publicationDate: formData.publicationDate || null,
				attachments: attachmentIds,
				writers: formData.writers || [],
				funds: fundDocumentId ? [fundDocumentId] : [],
				revision: formData.revision || null,
				bookStatus: formData.bookStatus || null,
				isbn: formData.isbn?.trim() || null,
				publisher: formData.publisher?.trim() || null,
				yearContracted: formData.yearContracted || null,
				refereed: formData.refereed || null,
				numberPages: formData.numberPages || null,
				researchType: formData.researchType || null,
			};
			Object.keys(bookData).forEach(k => {
				if (bookData[k] === null || bookData[k] === '') delete bookData[k];
			});
			if (isEdit && !attachmentsChanged) {
				delete bookData.attachments;
			}

			const partnersForRelation = Array.isArray(formData.partners) ? formData.partners : [];
			const usersPermissionsUsers = fundDocumentId ? Array.from(new Set(extractInternalUserIds(partnersForRelation))) : [];

			if (isEdit) {
				if (onSubmit) {
					await onSubmit(bookData);
				} else {
					await updateBook({ variables: { documentId, data: bookData } });
				}
			} else {
				await createBook({ variables: { data: bookData } });
			}

			if (fundDocumentId) {
				await updateFundPartners({
					variables: {
						documentId: fundDocumentId,
						data: {
							partners: partnersForRelation,
							users_permissions_users: usersPermissionsUsers
						}
					}
				});
			}

			if (isEdit) {
				toast.success('อัปเดตข้อมูลหนังสือสำเร็จ');
			} else {
				toast.success('สร้างข้อมูลหนังสือสำเร็จ');
				setFormData(BOOK_FORM_INITIAL);
			}
		} catch (e) {
			console.error(e);
			toast.error('เกิดข้อผิดพลาด: ' + (e.message || 'ไม่ทราบสาเหตุ'));
		} finally {
			setIsSubmitting(false);
		}
	}, [session?.jwt, formData, isEdit, onSubmit, updateBook, createBook, updateFundPartners, documentId]);

	// Memoize partners update to prevent infinite loop
	const updatePartnersFromFunding = useCallback(() => {
		if (!formData.__fundingObj) return;
		setFormData((prev) => ({ ...prev, partners: formData.__fundingObj.partners || [] }));
		if (!formData.numberPages) {
			setFormData((prev) => ({ ...prev, numberPages: String(formData.__fundingObj.pages) || null }));
		} else if (formData.__fundingObj.pages) {
			setFormData((prev) => ({ ...prev, numberPages: String(formData.__fundingObj.pages) || null }));
		}
	}, [formData.__fundingObj]);

	useEffect(() => {
		updatePartnersFromFunding();
	}, [updatePartnersFromFunding]);

	// Memoize form options
	const bookTypeOptions = useMemo(() => [
		{ value: '0', label: 'หนังสือ' },
		{ value: '1', label: 'ตำรา' },
	], []);

	const levelOptions = useMemo(() => [
		{ value: '0', label: 'ระดับชาติ' },
		{ value: '1', label: 'ระดับนานาชาติ' },
	], []);

	const yearOptions = useMemo(() => [
		{ value: '2019', label: '2019' },
		{ value: '2020', label: '2020' },
		{ value: '2021', label: '2021' },
		{ value: '2022', label: '2022' },
		{ value: '2023', label: '2023' },
		{ value: '2024', label: '2024' },
		{ value: '2025', label: '2025' },
		{ value: '2026', label: '2026' },
	], []);
	const statusOptions = useMemo(() => [
		{ value: 'draft', label: 'Draft' },
		{ value: 'proposed', label: 'Proposed' },
		{ value: 'under contract', label: 'Under Contract' },
		{ value: 'under review', label: 'Under Review' },
		{ value: 'accepted', label: 'Accepted' },
		{ value: 'in press', label: 'In Press' },
		{ value: 'published', label: 'Published' },
		{ value: 'e-book', label: 'E-Book' },
	], []);
	const refereedOptions = useMemo(() => [
		{ value: 'no', label: 'No' },
		{ value: 'yes', label: 'Yes' },
	], []);
	const researchTypeOptions = useMemo(() => [
		{ value: 'bds', label: 'BDS (Basic or Discovery Scholarship)' },
		{ value: 'ais', label: 'AIS (Applied or Integrative / application Scholarship)' },
		{ value: 'tls', label: 'TLS (Teaching and Learning Scholarship)' },
		{ value: 'nic', label: 'NIC (Not counted as a separate Intellectual Contribution)' },
	], []);

	// Memoize handlers for specific fields
	const handleBookTypeChange = useCallback((e) => handleInputChange('bookType', e.target.value), [handleInputChange]);
	const handleTitleTHChange = useCallback((e) => handleInputChange('titleTH', e.target.value), [handleInputChange]);
	const handleTitleENChange = useCallback((e) => handleInputChange('titleEN', e.target.value), [handleInputChange]);
	const handleDetailChange = useCallback((e) => handleInputChange('detail', e.target.value), [handleInputChange]);
	const handleLevelChange = useCallback((e) => handleInputChange('level', e.target.value), [handleInputChange]);
	const handlePublicationDateChange = useCallback((e) => handleInputChange('publicationDate', e.target.value), [handleInputChange]);
	const handleFundChange = useCallback((fund) => handleInputChange('__fundingObj', fund), [handleInputChange]);
	const handleAttachmentsChange = useCallback((files) => handleInputChange('attachments', files), [handleInputChange]);
	const handleWritersChange = useCallback((writers) => handleInputChange('writers', writers), [handleInputChange]);
	const handlePartnersChange = useCallback((partners) => handleInputChange('partners', partners), [handleInputChange]);

	console.log('Rendering BookForm with formData:', formData);

	return (
		<>
			<Block>
				<div className="inputGroup">
					<FormRadio
						id="bookType"
						label="ประเภทผลงาน"
						value={String(formData.bookType)}
						onChange={handleBookTypeChange}
						options={bookTypeOptions}
					/>
					<FormTextarea
						id="titleTH"
						label="ชื่อผลงาน (ไทย)"
						value={formData.titleTH}
						onChange={handleTitleTHChange}
						rows={4}
					/>
					<FormTextarea
						id="titleEN"
						label="ชื่อผลงาน (อังกฤษ)"
						value={formData.titleEN}
						onChange={handleTitleENChange}
						rows={4}
					/>
					<FormTextarea
						id="detail"
						label="รายละเอียดเบื้องต้น"
						value={formData.detail}
						onChange={handleDetailChange}
						rows={6}
					/>
					<FundPicker
						label="ทุนที่เกี่ยวข้อง"
						selectedFund={formData.__fundingObj}
						onSelect={handleFundChange}
					/>
					<FormRadio
						id="level"
						label="ระดับผลงาน"
						value={formData.level}
						onChange={handleLevelChange}
						options={levelOptions}
					/>
					<FormSelect
						id="revision"
						label="Revision (ถ้ามีโปรดระบุปี)"
						value={formData.revision ?? ""}
						placeholder="เลือก Revision"
						onChange={(val) => handleInputChange('revision', val)}
						options={yearOptions}
					/>
					<FormSelect
						id="status"
						label="Status"
						value={formData.bookStatus ?? ""}
						placeholder="Status"
						onChange={(val) => handleInputChange('bookStatus', val)}
						options={statusOptions}
					/>
					<FormInput
						id="isbn"
						label="ISBN"
						type="text"
						value={formData.isbn}
						onChange={(e) => handleInputChange('isbn', e.target.value)}
					/>
					<FormInput
						id="Publisher"
						label="Publisher (จำเป็นต้องระบุ)"
						type="text"
						value={formData.publisher}
						onChange={(e) => handleInputChange('publisher', e.target.value)}
					/>
					<FormSelect
						id="yearContracted"
						label="Year contracted (ระบุเป็น ค.ศ.)"
						value={formData.yearContracted ?? ""}
						placeholder="เลือก Year contracted"
						onChange={(val) => handleInputChange('yearContracted', val)}
						options={yearOptions}
					/>
					<FormSelect
						id="refereed"
						label="Refereed"
						value={formData.refereed ?? ""}
						placeholder="เลือก Refereed"
						onChange={(val) => handleInputChange('refereed', val)}
						options={refereedOptions}
					/>
					<FormSelect
						id="researchType"
						label="Research Type"
						value={formData.researchType ?? ""}
						placeholder="เลือก Research Type"
						onChange={(val) => handleInputChange('researchType', val)}
						options={researchTypeOptions}
					/>
					<FormInput
						id="numberPages"
						label="Number of Pages"
						type="text"
						value={formData.numberPages || ''}
						onChange={(e) => handleInputChange('numberPages', e.target.value)}
					/>
					<FileUploadField
						label="เอกสารแนบ"
						value={Array.isArray(formData.attachments) ? formData.attachments : []}
						onFilesChange={handleAttachmentsChange}
					/>
					{/* <WritersEditor 
						writers={formData.writers} 
						onChange={handleWritersChange} 
					/> */}
				</div>
			</Block>
			<Block className="mt-4">
				<Partners
					data={formData.partners}
					onChange={handlePartnersChange}
				/>
			</Block>
			<div className='flex justify-end items-center gap-3 mt-4'>
				<Button onClick={() => router.back()} variant="outline">ยกเลิก</Button>
				<Button
					variant="default"
					onClick={handleSubmit}
					disabled={isSubmitting}
				>
					{isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
				</Button>
			</div>
		</>
	);
}

