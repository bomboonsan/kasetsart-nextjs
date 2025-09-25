"use client";

// Components
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Block from "@/components/layout/Block";
import FieldInput from "@/components/myui/FieldInput"; // Assuming FieldInput corresponds to FormInput (adjust path if different)
import FieldSelect from "@/components/myui/FieldSelect"; // Adjust if needed
// Hooks
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Custom Hooks
import { useFormOptions } from '@/hooks/useFormOptions';

// Utils
import { formatToDigitsOnly, formatToEnglishOnly, formatToThaiOnly } from '@/utils/formatters';

const initialFormData = {
    firstNameTH: '',
    lastNameTH: '',
    firstNameEN: '',
    lastNameEN: '',
    highDegree: '',
    academic_types: '',
    email: '',
    username: '',
    telephoneNo: '',
    academicPosition: '',
    departments: '',
    faculties: '',
    organizations: '',
    participation: '',
    education: ''
};

const initialEducationItem = { level: '', institution: '', field: '', year: '' };

export default function AddUserPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [formData, setFormData] = useState(initialFormData);
    const [education, setEducation] = useState([{ ...initialEducationItem }]);
    const { options, loading: optionsLoading, error: optionsError } = useFormOptions(session);
    const [selectData, setSelectData] = useState({});
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    // Mirror options shape like edit page (for selects with original objects) via separate query? For simplicity reuse options
    useEffect(() => {
        setSelectData({
            departments: options.departments || [],
            faculties: options.faculties || [],
            organizations: options.organizations || [],
        });
    }, [options]);

    const handleInputChange = (field, value) => {
        let formattedValue = value;
        if (field === 'telephoneNo') {
            formattedValue = formatToDigitsOnly(value).slice(0, 10);
        } else if (field === 'firstNameEN' || field === 'lastNameEN') {
            formattedValue = formatToEnglishOnly(value);
        } else if (field === 'firstNameTH' || field === 'lastNameTH') {
            formattedValue = formatToThaiOnly(value);
        }
        setFormData(prev => ({ ...prev, [field]: formattedValue }));
    };

    // Education management
    const addEducation = () => setEducation(prev => [...prev, { ...initialEducationItem }]);
    const removeEducation = (index) => { if (education.length > 1) setEducation(prev => prev.filter((_, i) => i !== index)); };
    const updateEducation = (index, field, value) => setEducation(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleReset = () => {
        setFormData(initialFormData);
        setEducation([{ ...initialEducationItem }]);
        setAvatarFile(null);
        setPreviewUrl(null);
        setPassword('');
        setErrorMsg(null);
    };

    const extractDocumentId = (value) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return null;
        if (Array.isArray(value)) return extractDocumentId(value[0]);
        if (typeof value === 'object') return value.documentId || value.value || null;
        return value;
    };
    const resolveRelationId = (value, optionList) => {
        const documentId = extractDocumentId(value);
        if (!documentId || !Array.isArray(optionList)) return null;
        const match = optionList.find((item) => item.value === documentId || item.documentId === documentId);
        return match?.id || null; // numeric id
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        if (submitting) return;
        if (!password) {
            setErrorMsg('Password is required');
            return;
        }
        setSubmitting(true);
        try {
            // Upload avatar first if exists (need media id to include in payload)
            let uploadedAvatarId = null;
            if (avatarFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('files', avatarFile);
                const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1338';
                const token = session?.jwt; // user token (May not have permission to upload? assume yes)
                console.debug('[AddUser] uploading avatar to', `${strapiUrl}/api/upload`, { fileName: avatarFile.name, fileType: avatarFile.type });
                const uploadRes = await fetch(`${strapiUrl}/api/upload`, {
                    method: 'POST',
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    body: uploadFormData
                });
                const uploadText = await uploadRes.text();
                let uploadJson = null;
                try { uploadJson = JSON.parse(uploadText); } catch (e) { /* not json */ }
                console.debug('[AddUser] avatar upload response status:', uploadRes.status, 'body:', uploadJson || uploadText);
                if (!uploadRes.ok) {
                    throw new Error(`Upload failed: ${uploadRes.status} - ${uploadText}`);
                }
                if (Array.isArray(uploadJson) && uploadJson[0]?.id) uploadedAvatarId = uploadJson[0].id;
                else if (uploadJson?.[0]?.data?.id) uploadedAvatarId = uploadJson[0].data.id;
                else if (uploadJson?.data?.[0]?.id) uploadedAvatarId = uploadJson.data[0].id;
                console.debug('[AddUser] uploadedAvatarId', uploadedAvatarId);
            }

            const academicTypeId = resolveRelationId(formData.academic_types, options.academicTypes);
            const departmentId = resolveRelationId(formData.departments, options.departments);
            const facultyId = resolveRelationId(formData.faculties, options.faculties);
            const organizationId = resolveRelationId(formData.organizations, options.organizations);

            const payload = {
                username: formData.username || formData.email,
                email: formData.email,
                password: password,
                role: 1,
                firstNameTH: formData.firstNameTH,
                lastNameTH: formData.lastNameTH,
                firstNameEN: formData.firstNameEN,
                lastNameEN: formData.lastNameEN,
                telephoneNo: formData.telephoneNo,
                academicPosition: formData.academicPosition,
                highDegree: formData.highDegree,
                participation: formData.participation,
                education: JSON.stringify(education.filter(edu => edu.level || edu.institution || edu.field || edu.year)),
                academic_types: academicTypeId ? [academicTypeId] : null,
                departments: departmentId ? [departmentId] : null,
                faculties: facultyId ? [facultyId] : null,
                organizations: organizationId ? [organizationId] : null,
                confirmed: true,
                Blocked: false,
            };
            if (uploadedAvatarId) payload.avatar = uploadedAvatarId;

            console.debug('[AddUser] creating user with payload:', payload);
            const res = await fetch('/api/admin/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: session?.jwt ? `Bearer ${session.jwt}` : '' },
                body: JSON.stringify({ payload })
            });
            const respText = await res.text();
            let json = null;
            try { json = JSON.parse(respText); } catch (e) { /* ignore */ }
            console.debug('[AddUser] create response status:', res.status, 'body:', json || respText);
            if (!res.ok) {
                // Try to surface server error message if available
                const serverMessageRaw = json?.error || json?.message || respText || `status ${res.status}`;
                const serverMessage = typeof serverMessageRaw === 'object' ? JSON.stringify(serverMessageRaw) : String(serverMessageRaw);
                throw new Error(`Create failed: ${serverMessage}`);
            }
            if (json && json.success === false) {
                throw new Error(json?.error || json?.message || 'Create failed');
            }
            // Redirect
            router.push('/admin/user');
        } catch (err) {
            console.error(err);
            setErrorMsg(err.message || String(err));
        } finally {
            setSubmitting(false);
        }
    };

    if (optionsLoading) return <p>Loading form options...</p>;
    if (optionsError) return <p>Error: {optionsError}</p>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Block>
                <div className="flex items-center gap-6 mb-6">
                    <Image
                        src={previewUrl || '/profile-placeholder.svg'}
                        alt="Profile Avatar"
                        width={96}
                        height={96}
                        className="rounded-full aspect-square object-cover bg-gray-200"
                        unoptimized
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg, image/gif"
                    />
                    <Button type="button" onClick={() => fileInputRef.current?.click()}>
                        Change Image
                    </Button>
                </div>
                <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldInput label="ชื่อ" value={formData.firstNameTH || ''} onChange={(e) => handleInputChange('firstNameTH', e.target.value)} placeholder="กรุณาระบุชื่อ" />
                        <FieldInput label="นามสกุล" value={formData.lastNameTH || ''} onChange={(e) => handleInputChange('lastNameTH', e.target.value)} placeholder="กรุณาระบุนามสกุล" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldInput label="First Name" value={formData.firstNameEN || ''} onChange={(e) => handleInputChange('firstNameEN', e.target.value)} placeholder="First name in English" />
                        <FieldInput label="Last Name" value={formData.lastNameEN || ''} onChange={(e) => handleInputChange('lastNameEN', e.target.value)} placeholder="Last name in English" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldInput label="เบอร์ติดต่อ" value={formData.telephoneNo || ''} onChange={(e) => handleInputChange('telephoneNo', e.target.value)} placeholder="" />
                        <FieldInput label="อีเมล" type="email" value={formData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="กรุณาระบุอีเมล" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldInput label="Username" value={formData.username || ''} onChange={(e) => handleInputChange('username', e.target.value)} placeholder="(เว้นว่างเพื่อใช้ email)" />
                        <FieldInput label="รหัสผ่าน" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="กำหนดรหัสผ่านเริ่มต้น" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldInput label="ตำแหน่งทางวิชาการ" value={formData.academicPosition || ''} onChange={(e) => handleInputChange('academicPosition', e.target.value)} placeholder="" />
                        <FieldInput label="วุฒิการศึกษาสูงสุด" value={formData.highDegree || ''} onChange={(e) => handleInputChange('highDegree', e.target.value)} placeholder="เช่น Ph.D., M.Sc., B.Eng." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldSelect label="ประเภทอาจารย์" value={formData.academic_types || ''} onChange={(value) => handleInputChange('academic_types', value)} placeholder="เลือกประเภทอาจารย์" options={options.academicTypes} />
                        <FieldSelect
                            label="ประเภทการเข้าร่วม"
                            value={formData.participation || ''}
                            onChange={(value) => handleInputChange('participation', value)}
                            placeholder="เลือกประเภทการเข้าร่วม"
                            options={[
                                { value: "0", label: 'participating' },
                                { value: "1", label: 'supporting' }
                            ]}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FieldSelect label="เลือกภาควิชา" value={formData.departments?.[0]?.documentId ? formData.departments[0].documentId : formData.departments} onChange={(value) => handleInputChange('departments', value)} placeholder="เลือกภาควิชา" options={selectData.departments?.map(d => ({ value: d.documentId || d.value, label: d.title || d.label })) || []} />
                        <FieldSelect label="คณะ" value={formData.faculties?.[0]?.documentId ? formData.faculties[0].documentId : formData.faculties} onChange={(value) => handleInputChange('faculties', value)} placeholder="เลือกคณะ" options={selectData.faculties?.map(f => ({ value: f.documentId || f.value, label: f.title || f.label })) || []} />
                        <FieldSelect label="มหาวิทยาลัย/หน่วยงาน" value={formData.organizations?.[0]?.documentId ? formData.organizations[0].documentId : formData.organizations} onChange={(value) => handleInputChange('organizations', value)} placeholder="เลือกมหาวิทยาลัย/หน่วยงาน" options={selectData.organizations?.map(o => ({ value: o.documentId || o.value, label: o.title || o.label })) || []} />
                    </div>
                    <div className="flex gap-4">
                        <Button type="submit" disabled={submitting}>{submitting ? 'กำลังสร้าง...' : 'สร้างผู้ใช้'}</Button>
                        <Button type="button" variant="outline" onClick={handleReset} disabled={submitting}>ยกเลิก</Button>
                    </div>
                    {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
                </div>
            </Block>
            <Block>
                <div className="space-y-6 p-6">
                    <h2 className='text-lg text-gray-900'>วุฒิการศึกษา</h2>
                    <div className="space-y-4">
                        {education.map((edu, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 items-end pb-4 border-b last:border-b-0">
                                <div className="col-span-12 md:col-span-3">
                                    <FieldSelect
                                        label="ระดับวุฒิการศึกษา"
                                        value={edu.level}
                                        onChange={(value) => updateEducation(index, 'level', value)}
                                        placeholder="เลือกระดับการศึกษา"
                                        options={[
                                            { value: "ปริญญาตรี", label: 'ปริญญาตรี' },
                                            { value: "ปริญญาโท", label: 'ปริญญาโท' },
                                            { value: "ปริญญาเอก", label: 'ปริญญาเอก' }
                                        ]}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-4">
                                    <FieldInput
                                        label="ชื่อสถาบันการศึกษา"
                                        value={edu.institution}
                                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                        placeholder="กรุณาระบุชื่อสถาบันการศึกษา"
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-3">
                                    <FieldInput
                                        label="คณะ/สาขา"
                                        value={edu.field}
                                        onChange={(e) => updateEducation(index, 'field', e.target.value)}
                                        placeholder="กรุณาระบุสาขาวิชา"
                                    />
                                </div>
                                <div className="col-span-9 md:col-span-1">
                                    <FieldInput
                                        label="ปีที่สำเร็จ"
                                        value={edu.year}
                                        onChange={(e) => updateEducation(index, 'year', e.target.value)}
                                        placeholder="ปี"
                                    />
                                </div>
                                <div className="col-span-3 md:col-span-1 flex justify-end">
                                    <Button
                                        variant="secondary"
                                        type="button"
                                        onClick={() => removeEducation(index)}
                                        disabled={education.length === 1}
                                        className="h-10"
                                    >
                                        -
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center space-x-4 pt-2">
                        <Button type="button" variant="secondary" onClick={addEducation}>เพิ่มวุฒิการศึกษา</Button>
                    </div>
                </div>
            </Block>
        </form>
    );
}