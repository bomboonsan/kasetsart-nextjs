"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery } from '@apollo/client/react';
import Block from '../layout/Block';
import FormTextarea from '@/components/myui/FormTextarea';
import FormRadio from '@/components/myui/FormRadio';
import FormInput from '@/components/myui/FormInput';
import FileUploadField from './FileUploadField';
import Partners from './Partners';
import FundPicker from './FundPicker';
import { Button } from '@/components/ui/button';
import { BOOK_FORM_INITIAL } from '@/data/book';
import { CREATE_BOOK, UPDATE_BOOK, GET_BOOK } from '@/graphql/formQueries';
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

			const bookData = {
				bookType: formData.bookType ?? "0",
				titleTH: formData.titleTH?.trim() || null,
				titleEN: formData.titleEN?.trim() || null,
				detail: formData.detail?.trim() || null,
				level: formData.level === '' ? null : formData.level,
				publicationDate: formData.publicationDate || null,
				attachments: attachmentIds,
				writers: formData.writers || [],
				funds: formData.__fundingObj?.documentId ? [formData.__fundingObj.documentId] : [],
			};
			Object.keys(bookData).forEach(k => {
				if (bookData[k] === null || bookData[k] === '') delete bookData[k];
			});
			if (isEdit && !attachmentsChanged) {
				delete bookData.attachments;
			}

			if (isEdit) {
				if (onSubmit) {
					await onSubmit(bookData);
				} else {
					await updateBook({ variables: { documentId, data: bookData } });
				}
				toast.success('อัปเดตข้อมูลหนังสือสำเร็จ');
			} else {
				await createBook({ variables: { data: bookData } });
				toast.success('สร้างข้อมูลหนังสือสำเร็จ');
				setFormData(BOOK_FORM_INITIAL);
			}
		} catch (e) {
			console.error(e);
			toast.error('เกิดข้อผิดพลาด: ' + (e.message || 'ไม่ทราบสาเหตุ'));
		} finally {
			setIsSubmitting(false);
		}
	}, [session?.jwt, formData, isEdit, onSubmit, updateBook, createBook, documentId]);

	// Memoize partners update to prevent infinite loop
	const updatePartnersFromFunding = useCallback(() => {
		if (!formData.__fundingObj) return;
		setFormData((prev) => ({ ...prev, partners: formData.__fundingObj.partners || [] }));
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
					<FormRadio 
						id="level" 
						label="ระดับผลงาน" 
						value={formData.level} 
						onChange={handleLevelChange} 
						options={levelOptions} 
					/>
					<FormInput 
						id="publicationDate" 
						label="วันที่เกิดผลงาน" 
						type="date" 
						value={formData.publicationDate} 
						onChange={handlePublicationDateChange} 
					/>
					<FundPicker 
						label="ทุนที่เกี่ยวข้อง" 
						selectedFund={formData.__fundingObj} 
						onSelect={handleFundChange} 
					/>
					<FileUploadField 
						label="เอกสารแนบ" 
						value={Array.isArray(formData.attachments) ? formData.attachments : []} 
						onFilesChange={handleAttachmentsChange} 
					/>
					<WritersEditor 
						writers={formData.writers} 
						onChange={handleWritersChange} 
					/>
				</div>
			</Block>
			<Block className="mt-4">
				<Partners 
					data={formData.partners} 
					onChange={handlePartnersChange} 
				/>
			</Block>
			<div className='flex justify-end items-center gap-3 mt-4'>
				<Button variant="outline">ยกเลิก</Button>
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

