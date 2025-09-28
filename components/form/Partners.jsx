'use client';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Block from '../layout/Block';
import FormInput from '../myui/FormInput';
import FormSelect from '../myui/FormSelect';
import FormCheckbox from '../myui/FormCheckbox';
import UserPicker from './UserPicker';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function Partners({ data, onChange }) {
    const [displayRows, setDisplayRows] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [modalIsInternal, setModalIsInternal] = useState(true);
    const [modalUserObj, setModalUserObj] = useState(null);
    const [modalPartnerFullName, setModalPartnerFullName] = useState('');
    const [modalOrgName, setModalOrgName] = useState('');
    const [modalPartnerType, setModalPartnerType] = useState('');
    const [modalPartnerProportionCustom, setModalPartnerProportionCustom] = useState('');
    const [modalPartnerCommentArr, setModalPartnerCommentArr] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    // Use useMemo to prevent recalculation on every render
    const hasFirstAuthor = useMemo(() => {
        return displayRows.some(p => p.partnerComment?.includes('First Author'));
    }, [displayRows]);
    
    const hasCorresponding = useMemo(() => {
        return displayRows.some(p => p.partnerComment?.includes('Corresponding Author'));
    }, [displayRows]);

    useEffect(() => {
        // Initialize with sorted data from props with null safety
        if (!data) {
            setDisplayRows([]);
            return;
        }
        
        const sortedData = Array.isArray(data) ? [...data].sort((a, b) => (a?.order || 0) - (b?.order || 0)) : [];
        setDisplayRows(sortedData);
    }, [data]);

    const handleDataChange = useCallback((newRows) => {
        // assign order
        let sortedRows = newRows.map((row, index) => ({ ...row, order: index + 1 }));

        // Calculate partnerProportion: equal split among internal partners (sum to 1)
        const internalCount = sortedRows.filter(r => r.isInternal).length;
        if (internalCount > 0) {
            const share = 1 / internalCount;
            sortedRows = sortedRows.map(r => ({
                ...r,
                partnerProportion: r.isInternal ? Number(share) : 0
            }));
        } else {
            sortedRows = sortedRows.map(r => ({ ...r, partnerProportion: 0 }));
        }

        setDisplayRows(sortedRows);
        if (onChange) {
            onChange(sortedRows);
        }
    }, [onChange]);

    const resetForm = useCallback(() => {
        setModalIsInternal(true);
        setModalUserObj(null);
        setModalPartnerFullName('');
        setModalOrgName('');
        setModalPartnerType('');
        setModalPartnerProportionCustom('');
        setModalPartnerCommentArr([]);
        setEditingIndex(null);
        setDialogOpen(false);
    }, []);

    const handleAddPartner = useCallback(() => {
        const newPartner = {
            id: editingIndex !== null ? displayRows[editingIndex].id : Date.now(), // Generate ID if creating new
            userID: modalUserObj ? modalUserObj.documentId : undefined,
            User: modalUserObj,
            fullname: modalPartnerFullName,
            orgName: modalOrgName,
            partnerType: modalPartnerType,
            partnerProportion_percentage_custom: modalPartnerProportionCustom,
            partnerProportion: "", // <<- มาจากเอาจำนวน partner ที่งหมดที่มี isInternal = true มาแบ่งกันเป็นหน่วยสัดส่วน เต็ม 1 
            partnerComment: modalPartnerCommentArr.join(', '),
            isInternal: modalIsInternal,
        };

        let newRows;
        if (editingIndex !== null) {
            newRows = [...displayRows];
            newRows[editingIndex] = newPartner;
        } else {
            newRows = [...displayRows, newPartner];
        }

        handleDataChange(newRows);
        resetForm();
        // dialog controlled by React state; resetForm will close it
    }, [displayRows, editingIndex, modalUserObj, modalPartnerFullName, modalOrgName, modalPartnerType, modalPartnerProportionCustom, modalPartnerCommentArr, modalIsInternal, handleDataChange, resetForm]);

    const handleEditPartner = useCallback((index) => {
        const partner = displayRows[index];
        setEditingIndex(index);
        setModalIsInternal(partner.isInternal);
        setModalUserObj(partner.User || null);
        setModalPartnerFullName(partner.fullname || '');
        setModalOrgName(partner.orgName || '');
        setModalPartnerType(partner.partnerType || '');
        setModalPartnerProportionCustom(partner.partnerProportion_percentage_custom || '');
        setModalPartnerCommentArr(partner.partnerComment ? partner.partnerComment.split(',').map(s => s.trim()) : []);
        setDialogOpen(true);
    }, [displayRows]);

    const handleRemovePartner = useCallback((index) => {
        const newRows = displayRows.filter((_, i) => i !== index);
        handleDataChange(newRows);
    }, [displayRows, handleDataChange]);

    const moveUp = useCallback((index) => {
        if (index === 0) return;
        const newRows = [...displayRows];
        [newRows[index - 1], newRows[index]] = [newRows[index], newRows[index - 1]];
        handleDataChange(newRows);
    }, [displayRows, handleDataChange]);

    const moveDown = useCallback((index) => {
        if (index === displayRows.length - 1) return;
        const newRows = [...displayRows];
        [newRows[index], newRows[index + 1]] = [newRows[index + 1], newRows[index]];
        handleDataChange(newRows);
    }, [displayRows, handleDataChange]);

    // Memoized options to prevent recreation on every render
    const partnerTypeOptions = useMemo(() => [
        { value: 'หัวหน้าโครงการ', label: 'หัวหน้าโครงการ' },
        { value: 'ที่ปรึกษาโครงการ', label: 'ที่ปรึกษาโครงการ' },
        { value: 'ผู้ประสานงาน', label: 'ผู้ประสานงาน' },
        { value: 'นักวิจัยร่วม', label: 'นักวิจัยร่วม' },
        { value: 'อื่นๆ', label: 'อื่นๆ' },
    ], []);
    const partnerDisplayName = useMemo(() => {
        if (modalUserObj) {
            return modalUserObj.firstNameTH && modalUserObj.lastNameTH
                ? `${modalUserObj.firstNameTH} ${modalUserObj.lastNameTH}`.trim()
                : modalUserObj.email || '';
        }
        return modalPartnerFullName || '';
    }, [modalUserObj, modalPartnerFullName]);

    const organizationDisplayName = useMemo(() => {
        if (modalUserObj) {
            const orgParts = [];
            if (modalUserObj.departments && modalUserObj.departments[0]?.name) orgParts.push(modalUserObj.departments[0].name);
            if (modalUserObj.faculties && modalUserObj.faculties[0]?.name) orgParts.push(modalUserObj.faculties[0].name);
            if (modalUserObj.organizations && modalUserObj.organizations[0]?.name) orgParts.push(modalUserObj.organizations[0].name);
            // Fallback to old structure
            if (orgParts.length === 0) {
                if (modalUserObj.department?.name) orgParts.push(modalUserObj.department.name);
                if (modalUserObj.faculty?.name) orgParts.push(modalUserObj.faculty.name);
                if (modalUserObj.organization?.name) orgParts.push(modalUserObj.organization.name);
            }
            return orgParts.join(' ');
        }
        return modalOrgName || '';
    }, [modalUserObj, modalOrgName]);


    return (
        <>
            <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
                <DialogTrigger asChild>
                    <Button variant="default" size="sm" className="mb-4" onClick={() => { resetForm(); setDialogOpen(true); }}>เพิ่มสมาชิก</Button>
                </DialogTrigger>
                <DialogContent className="md:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>เพิ่ม / แก้ไข ผู้ร่วมโครงการวิจัย</DialogTitle>
                        <DialogDescription>กรอกข้อมูลผู้ร่วมโครงการวิจัยที่เกี่ยวข้องกับโครงการ</DialogDescription>
                    </DialogHeader>
                    <div className="p-4 rounded-xl">
                        <div className="space-y-4">
                            <div className="flex items-center gap-10">
                                <label className="flex items-center gap-3 text-zinc-700">
                                    <input
                                        type="radio"
                                        value="true"
                                        checked={modalIsInternal === true}
                                        onChange={() => setModalIsInternal(true)}
                                        className="form-radio text-blue-600"
                                    />
                                    ภายใน มก.
                                </label>
                                <label className="flex items-center gap-3 text-zinc-700">
                                    <input
                                        type="radio"
                                        value="false"
                                        checked={modalIsInternal === false}
                                        onChange={() => setModalIsInternal(false)}
                                        className="form-radio text-blue-600"
                                    />
                                    ภายนอก มก. (หัวหน้าโครงการวิจัยภายนอก มก. นิสิต และลูกจ้าง)
                                </label>
                            </div>
                            {
                                modalIsInternal === true ? (
                                    <>
                                        <div>
                                            <UserPicker
                                                label="ผู้ร่วมโครงการวิจัย"
                                                selectedUser={modalUserObj}
                                                onSelect={useCallback((u) => {
                                                    if (!u) {
                                                        setModalUserObj(null);
                                                        return;
                                                    }
                                                    setModalUserObj(u);
                                                    
                                                    // Safe access to profile
                                                    const prof = Array.isArray(u.profile) ? u.profile[0] : u.profile;
                                                    const display = prof 
                                                        ? `${prof.firstName || ''} ${prof.lastName || ''}`.trim() 
                                                        : (u.firstNameTH && u.lastNameTH 
                                                            ? `${u.firstNameTH} ${u.lastNameTH}`.trim()
                                                            : u.email || '');
                                                    
                                                    // Safe access to organization data
                                                    const orgParts = [];
                                                    if (u.departments && u.departments[0]?.name) orgParts.push(u.departments[0].name);
                                                    if (u.faculties && u.faculties[0]?.name) orgParts.push(u.faculties[0].name);
                                                    if (u.organizations && u.organizations[0]?.name) orgParts.push(u.organizations[0].name);
                                                    // Fallback to old structure if new doesn't exist
                                                    if (orgParts.length === 0) {
                                                        if (u.department?.name) orgParts.push(u.department.name);
                                                        if (u.faculty?.name) orgParts.push(u.faculty.name);
                                                        if (u.organization?.name) orgParts.push(u.organization.name);
                                                    }
                                                    const org = orgParts.join(' ');
                                                    
                                                    setModalPartnerFullName(display);
                                                    setModalOrgName(org);
                                                }, [])}
                                            />
                                        </div>
                                        <div>
                                            <FormInput
                                                label="ชื่อผู้ร่วมโครงการวิจัย"
                                                type="text"
                                                value={partnerDisplayName}
                                                readOnly={!!modalUserObj}
                                                onChange={(value) => {
                                                    // allow manual name editing when internal but not linked to a user
                                                    if (!modalUserObj) setModalPartnerFullName(value)
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <FormInput
                                                label="ชื่อหน่วยงาน"
                                                type="text"
                                                value={organizationDisplayName}
                                                readOnly={!!modalUserObj}
                                                onChange={(value) => {
                                                    if (!modalUserObj) setModalOrgName(value)
                                                }}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <FormInput
                                                label="ชื่อผู้ร่วมโครงการวิจัย"
                                                type="text"
                                                value={modalPartnerFullName}
                                                onChange={(e) => setModalPartnerFullName(e.target.value)}
                                                placeholder="กรอกชื่อ-นามสกุล"
                                            />
                                        </div>
                                        <div>
                                            <FormInput
                                                label="ชื่อหน่วยงาน"
                                                type="text"
                                                value={modalOrgName}
                                                onChange={(e) => setModalOrgName(e.target.value)}
                                                placeholder="กรอกชื่อหน่วยงาน"
                                            />
                                        </div>
                                    </>
                                )
                            }
                            <div>
                                <FormSelect
                                    label="ประเภทผู้ร่วมโครงการวิจัย"
                                    value={modalPartnerType}
                                    onChange={(value) => setModalPartnerType(value)}
                                    className="max-w-lg"
                                    placeholder="เลือกประเภท"
                                    options={partnerTypeOptions}
                                />
                            </div>
                            <div>
                                <FormInput
                                    label="สัดส่วนการมีส่วนร่วม (%)"
                                    type="number"
                                    step="0.001"
                                    min="0"
                                    max="100"
                                    value={modalPartnerProportionCustom || ''}
                                    onChange={(e) => {
                                        // allow empty or valid number between 0-100
                                        if (e.target.value === '' || e.target.value === null) {
                                            setModalPartnerProportionCustom('')
                                            return
                                        }
                                        const num = parseFloat(String(e.target.value))
                                        if (Number.isNaN(num)) return
                                        const clamped = Math.max(0, Math.min(100, num))
                                        setModalPartnerProportionCustom(String(clamped))
                                    }}
                                    placeholder="0%"
                                />
                            </div>
                            <div>
                                <FormCheckbox
                                    label="หมายเหตุ"
                                    inline={true}
                                    value={Array.isArray(modalPartnerCommentArr) ? modalPartnerCommentArr : (modalPartnerCommentArr ? String(modalPartnerCommentArr).split(',').map(s => s.trim()).filter(Boolean) : [])}
                                    onChange={(e) => setModalPartnerCommentArr(Array.isArray(e.target.value) ? e.target.value : [])}
                                    className="max-w-lg"
                                    options={[
                                        ...(!hasFirstAuthor || (Array.isArray(modalPartnerCommentArr) && modalPartnerCommentArr.includes('First Author')) ? [{ value: 'First Author', label: 'First Author' }] : []),
                                        ...(!hasCorresponding || (Array.isArray(modalPartnerCommentArr) && modalPartnerCommentArr.includes('Corresponding Author')) ? [{ value: 'Corresponding Author', label: 'Corresponding Author' }] : []),
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" size="sm" onClick={() => { resetForm(); }}>
                                ยกเลิก
                            </Button>
                        </DialogClose>
                        <Button variant="default" size="sm" onClick={() => { handleAddPartner(); }}>
                            {editingIndex !== null ? 'บันทึก' : 'เพิ่ม'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div className="bg-white border border-gray-200 rounded-b-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ลำดับ
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ชื่อ-นามสกุล
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    หน่วยงาน
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ประเภทผู้ร่วมโครงการวิจัย
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    หมายเหตุ
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    สัดส่วนการมีส่วนร่วม (%)
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    สัดส่วนการวิจัย (%)
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    การจัดการ
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {displayRows.map((p, i) => (
                                <tr key={p.id || p.userID || i} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div
                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[#065F46] text-sm font-mediumbg-[#D1FAE5]`}
                                            >
                                                {i + 1}
                                            </div>
                                            {(displayRows.length >= 2) && (
                                                <div className='text-gray-700 flex items-center gap-2 ml-3'>
                                                    <Button size="sm" variant="ghost" onClick={() => moveUp(i)} disabled={i === 0}>
                                                        <ChevronUp />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => moveDown(i)} disabled={i === displayRows.length - 1}>
                                                        <ChevronDown />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {p.fullname ? p.fullname : "ไม่ระบุ"}
                                            </div>
                                            <span className='text-xs text-gray-700'>{p.isInternal ? "บุคคลภายใน" : "บุคคลภายนอก"}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {p.orgName || '-'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{p.partnerType || '-'}</div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{p.partnerComment || '-'}</div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        {p.partnerProportion_percentage_custom && (p.partnerProportion_percentage_custom !== '' && p.partnerProportion_percentage_custom !== null) && (
                                            <div className="text-sm text-gray-900">
                                                {(parseFloat(p.partnerProportion_percentage_custom) || 0)}%
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        {p.partnerProportion && (p.partnerProportion !== '' && p.partnerProportion !== null) && (
                                            <div className="text-sm text-gray-900">
                                                {(Number(p.partnerProportion) || 0).toFixed(1)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {(displayRows.length >= 1) && (
                                            <div className="flex items-center gap-3 justify-center">
                                                <Button size="sm" variant="ghost" onClick={() => handleEditPartner(i)}>
                                                    แก้ไข
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => handleRemovePartner(i)}>
                                                    ลบ
                                                </Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}