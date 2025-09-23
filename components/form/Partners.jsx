import React, { useState, useEffect } from 'react';
import Block from '../layout/Block';
import FormInput from '../myui/FormInput';
import FormSelect from '../myui/FormSelect';
import FormCheckbox from '../myui/FormCheckbox';
// import UserPicker from './UserPicker';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function Partners({ data, onChange }) {
    const [displayRows, setDisplayRows] = useState([]);
    const [modalIsInternal, setModalIsInternal] = useState(true);
    const [modalUserObj, setModalUserObj] = useState(null);
    const [modalPartnerFullName, setModalPartnerFullName] = useState('');
    const [modalOrgName, setModalOrgName] = useState('');
    const [modalPartnerType, setModalPartnerType] = useState('');
    const [modalPartnerProportionCustom, setModalPartnerProportionCustom] = useState('');
    const [modalPartnerCommentArr, setModalPartnerCommentArr] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [hasFirstAuthor, setHasFirstAuthor] = useState(false);
    const [hasCorresponding, setHasCorresponding] = useState(false);

    useEffect(() => {
        setHasFirstAuthor(displayRows.some(p => p.partnerComment?.includes('First Author')));
        setHasCorresponding(displayRows.some(p => p.partnerComment?.includes('Corresponding Author')));
    }, [displayRows]);

    useEffect(() => {
        // Initialize with sorted data from props
        const sortedData = Array.isArray(data) ? [...data].sort((a, b) => a.order - b.order) : [];
        console.log('Initializing Partners with data:', sortedData);
        setDisplayRows(sortedData);
    }, [data]);

    const handleDataChange = (newRows) => {
        const sortedRows = newRows.map((row, index) => ({ ...row, order: index + 1 }));
        setDisplayRows(sortedRows);
        if (onChange) {
            onChange(sortedRows);
        }
    };

    const resetForm = () => {
        setModalIsInternal(true);
        setModalUserObj(null);
        setModalPartnerFullName('');
        setModalOrgName('');
        setModalPartnerType('');
        setModalPartnerProportionCustom('');
        setModalPartnerCommentArr([]);
        setEditingIndex(null);
    };

    const handleAddPartner = () => {
        const newPartner = {
            id: editingIndex !== null ? displayRows[editingIndex].id : Date.now(), // Generate ID if creating new
            userID: modalUserObj ? modalUserObj.id : undefined,
            User: modalUserObj,
            fullname: modalPartnerFullName,
            orgName: modalOrgName,
            partnerType: modalPartnerType,
            partnerProportion_percentage_custom: modalPartnerProportionCustom,
            partnerProportion: parseFloat(modalPartnerProportionCustom) / 100 || 0, // Convert percentage to decimal
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
        const dlg = document.getElementById('my_modal_2');
        if (dlg && dlg.close) dlg.close();
    };

    const handleEditPartner = (index) => {
        const partner = displayRows[index];
        setEditingIndex(index);
        setModalIsInternal(partner.isInternal);
        setModalUserObj(partner.User || null);
        setModalPartnerFullName(partner.fullname || '');
        setModalOrgName(partner.orgName || '');
        setModalPartnerType(partner.partnerType || '');
        setModalPartnerProportionCustom(partner.partnerProportion_percentage_custom || '');
        setModalPartnerCommentArr(partner.partnerComment ? partner.partnerComment.split(',').map(s => s.trim()) : []);
        document.getElementById('my_modal_2').showModal();
    };

    const handleRemovePartner = (index) => {
        const newRows = displayRows.filter((_, i) => i !== index);
        handleDataChange(newRows);
    };

    const moveUp = (index) => {
        if (index === 0) return;
        const newRows = [...displayRows];
        [newRows[index - 1], newRows[index]] = [newRows[index], newRows[index - 1]];
        handleDataChange(newRows);
    };

    const moveDown = (index) => {
        if (index === displayRows.length - 1) return;
        const newRows = [...displayRows];
        [newRows[index], newRows[index + 1]] = [newRows[index + 1], newRows[index]];
        handleDataChange(newRows);
    };

    return (
        <>
            <dialog id="my_modal_2" className="modal left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="modal-box max-w-5xl text-gray-700">
                    <div className="p-4 rounded-xl shadow-2xl">
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
                                        {/* <UserPicker
                                            label="ผู้ร่วมโครงการวิจัย"
                                            selectedUser={modalUserObj}
                                            onSelect={(u) => {
                                                setModalUserObj(u)
                                                const prof = Array.isArray(u.profile) ? u.profile[0] : u.profile
                                                const display = prof ? `${prof.firstName || ''} ${prof.lastName || ''}`.trim() : u.email
                                                const org = [u.department?.name, u.faculty?.name, u.organization?.name].filter(Boolean).join(' ')
                                                setModalPartnerFullName(display)
                                                setModalOrgName(org)
                                            }}
                                        /> */}
                                    </div>
                                    <div>
                                        <FormInput
                                            label="ชื่อผู้ร่วมโครงการวิจัย"
                                            type="text"
                                            value={(() => {
                                                if (modalUserObj) {
                                                    const prof = Array.isArray(modalUserObj.profile) ? modalUserObj.profile[0] : modalUserObj.profile
                                                    return prof ? `${prof.firstNameTH || ''} ${prof.lastNameTH || ''}`.trim() : modalUserObj.email
                                                }
                                                return modalPartnerFullName || ''
                                            })()}
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
                                            value={(() => {
                                                if (modalUserObj) {
                                                    return [
                                                        modalUserObj.department?.name,
                                                        modalUserObj.faculty?.name,
                                                        modalUserObj.organization?.name
                                                    ].filter(Boolean).join(' ')
                                                }
                                                return modalOrgName || ''
                                            })()}
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
                                            onChange={(value) => setModalPartnerFullName(value)}
                                            placeholder="กรอกชื่อ-นามสกุล"
                                        />
                                    </div>
                                    <div>
                                        <FormInput
                                            label="ชื่อหน่วยงาน"
                                            type="text"
                                            value={modalOrgName}
                                            onChange={(value) => setModalOrgName(value)}
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
                                options={[
                                    { value: 'หัวหน้าโครงการ', label: 'หัวหน้าโครงการ' },
                                    { value: 'ที่ปรึกษาโครงการ', label: 'ที่ปรึกษาโครงการ' },
                                    { value: 'ผู้ประสานงาน', label: 'ผู้ประสานงาน' },
                                    { value: 'นักวิจัยร่วม', label: 'นักวิจัยร่วม' },
                                    { value: 'อื่นๆ', label: 'อื่นๆ' },
                                ]}
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
                                onChange={(value) => {
                                    // allow empty or valid number between 0-100
                                    if (value === '' || value === null) {
                                        setModalPartnerProportionCustom('')
                                        return
                                    }
                                    const num = parseFloat(String(value))
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
                                onChange={(e) => setModalPartnerCommentArr(e.target.value)}
                                className="max-w-lg"
                                options={[
                                    ...(!hasFirstAuthor || (Array.isArray(modalPartnerCommentArr) && modalPartnerCommentArr.includes('First Author')) ? [{ value: 'First Author', label: 'First Author' }] : []),
                                    ...(!hasCorresponding || (Array.isArray(modalPartnerCommentArr) && modalPartnerCommentArr.includes('Corresponding Author')) ? [{ value: 'Corresponding Author', label: 'Corresponding Author' }] : []),
                                ]}
                            />
                        </div>
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end mt-4">
                        <button onClick={handleAddPartner} type="button" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                            {editingIndex !== null ? 'บันทึก' : 'เพิ่ม'}
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                            onClick={() => { resetForm(); const dlg = document.getElementById('my_modal_2'); if (dlg && dlg.close) dlg.close(); }}
                        >
                            ยกเลิก
                        </button>
                    </div>
                </div>
                <div
                    className="modal-backdrop backdrop-blur-sm"
                    onClick={() => { resetForm(); const dlg = document.getElementById('my_modal_2'); if (dlg && dlg.close) dlg.close(); }}
                />
            </dialog>
            <button type="button" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700" onClick={() => {
                resetForm();
                document.getElementById('my_modal_2').showModal();
            }}>
                เพิ่มสมาชิก
            </button>
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
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[#065F46] text-sm font-medium
                          bg-[#D1FAE5]
                        `}
                                            >
                                                {i + 1}
                                            </div>
                                            {(displayRows.length >= 2) && (
                                                <div className='text-gray-700 flex items-center gap-2 ml-3'>
                                                    <button
                                                        type="button"
                                                        onClick={() => moveUp(i)}
                                                        disabled={i === 0}
                                                        className={`px-2 py-1 rounded bg-gray-100 text-xs ${i === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                                                    >
                                                        <ChevronUp />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => moveDown(i)}
                                                        disabled={i === displayRows.length - 1}
                                                        className={`px-2 py-1 rounded bg-gray-100 text-xs ${i === displayRows.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                                                    >
                                                        <ChevronDown />
                                                    </button>
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
                                        {p.partnerProportion_percentage_custom && (
                                            <div className="text-sm text-gray-900">
                                                {(parseFloat(p.partnerProportion_percentage_custom))}%
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        {p.partnerProportion && (
                                            <div className="text-sm text-gray-900">
                                                {(Number(p.partnerProportion).toFixed(1))}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {(displayRows.length >= 1) && (
                                            <div className="flex items-center gap-3 justify-end">
                                                <button type="button" onClick={() => handleEditPartner(i)} className="text-blue-600 hover:text-blue-900">
                                                    แก้ไข
                                                </button>
                                                <button type="button" onClick={() => handleRemovePartner(i)} className="text-red-600 hover:text-red-900">
                                                    ลบ
                                                </button>
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