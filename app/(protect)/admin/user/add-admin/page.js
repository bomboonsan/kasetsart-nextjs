"use client";

// Components
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Block from "@/components/layout/Block";
import FieldInput from "@/components/myui/FieldInput";
import FieldSelect from "@/components/myui/FieldSelect";
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
    email: '',
    username: '',
    telephoneNo: '',
    departments: '',
    faculties: '',
    organizations: '',
    role: ''
};

export default function AddAdminPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [formData, setFormData] = useState(initialFormData);
    const { options, loading: optionsLoading, error: optionsError } = useFormOptions(session);
    const [selectData, setSelectData] = useState({});
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    // Role options
    const roleOptions = [
        { 
            value: 'nv62t3lijrmcf91kf97zc18j', 
            label: 'Admin',
            id: 3,
            documentId: 'nv62t3lijrmcf91kf97zc18j'
        },
        { 
            value: 'paz95zzzpd60h4c9toxlbqkl', 
            label: 'Super Admin',
            id: 4,
            documentId: 'paz95zzzpd60h4c9toxlbqkl'
        }
    ];

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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleReset = () => {
        setFormData(initialFormData);
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
        return match?.id || null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        if (submitting) return;
        if (!password) {
            setErrorMsg('Password is required');
            return;
        }
        if (!formData.role) {
            setErrorMsg('Please select a role');
            return;
        }
        setSubmitting(true);
        try {
            // Upload avatar first if exists
            let uploadedAvatarId = null;
            if (avatarFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('files', avatarFile);
                const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1338';
                const token = session?.jwt;
                console.debug('[AddAdmin] uploading avatar to', `${strapiUrl}/api/upload`, { fileName: avatarFile.name, fileType: avatarFile.type });
                const uploadRes = await fetch(`${strapiUrl}/api/upload`, {
                    method: 'POST',
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    body: uploadFormData
                });
                const uploadText = await uploadRes.text();
                let uploadJson = null;
                try { uploadJson = JSON.parse(uploadText); } catch (e) { /* not json */ }
                console.debug('[AddAdmin] avatar upload response status:', uploadRes.status, 'body:', uploadJson || uploadText);
                if (!uploadRes.ok) {
                    throw new Error(`Upload failed: ${uploadRes.status} - ${uploadText}`);
                }
                if (Array.isArray(uploadJson) && uploadJson[0]?.id) uploadedAvatarId = uploadJson[0].id;
                else if (uploadJson?.[0]?.data?.id) uploadedAvatarId = uploadJson[0].data.id;
                else if (uploadJson?.data?.[0]?.id) uploadedAvatarId = uploadJson.data[0].id;
                console.debug('[AddAdmin] uploadedAvatarId', uploadedAvatarId);
            }

            const departmentId = resolveRelationId(formData.departments, options.departments);
            const facultyId = resolveRelationId(formData.faculties, options.faculties);
            const organizationId = resolveRelationId(formData.organizations, options.organizations);
            
            // Get the role ID from the selected role
            const selectedRole = roleOptions.find(r => r.value === formData.role || r.documentId === formData.role);
            const roleId = selectedRole?.id || 3; // Default to Admin (3) if not found

            const payload = {
                username: formData.username || formData.email,
                email: formData.email,
                password: password,
                role: roleId,
                firstNameTH: formData.firstNameTH,
                lastNameTH: formData.lastNameTH,
                firstNameEN: formData.firstNameEN,
                lastNameEN: formData.lastNameEN,
                telephoneNo: formData.telephoneNo,
                departments: departmentId ? [departmentId] : null,
                faculties: facultyId ? [facultyId] : null,
                organizations: organizationId ? [organizationId] : null,
                confirmed: true,
                Blocked: false,
            };
            if (uploadedAvatarId) payload.avatar = uploadedAvatarId;

            console.debug('[AddAdmin] creating admin user with payload:', payload);
            const res = await fetch('/api/admin/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: session?.jwt ? `Bearer ${session.jwt}` : '' },
                body: JSON.stringify({ payload })
            });
            const respText = await res.text();
            let json = null;
            try { json = JSON.parse(respText); } catch (e) { /* ignore */ }
            console.debug('[AddAdmin] create response status:', res.status, 'body:', json || respText);
            if (!res.ok) {
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
                        <FieldSelect 
                            label="บทบาท (Role)" 
                            value={formData.role || ''} 
                            onChange={(value) => handleInputChange('role', value)} 
                            placeholder="เลือกบทบาท" 
                            options={roleOptions} 
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FieldSelect label="เลือกภาควิชา" value={formData.departments?.[0]?.documentId ? formData.departments[0].documentId : formData.departments} onChange={(value) => handleInputChange('departments', value)} placeholder="เลือกภาควิชา" options={selectData.departments?.map(d => ({ value: d.documentId || d.value, label: d.title || d.label })) || []} />
                        <FieldSelect label="คณะ" value={formData.faculties?.[0]?.documentId ? formData.faculties[0].documentId : formData.faculties} onChange={(value) => handleInputChange('faculties', value)} placeholder="เลือกคณะ" options={selectData.faculties?.map(f => ({ value: f.documentId || f.value, label: f.title || f.label })) || []} />
                        <FieldSelect label="มหาวิทยาลัย/หน่วยงาน" value={formData.organizations?.[0]?.documentId ? formData.organizations[0].documentId : formData.organizations} onChange={(value) => handleInputChange('organizations', value)} placeholder="เลือกมหาวิทยาลัย/หน่วยงาน" options={selectData.organizations?.map(o => ({ value: o.documentId || o.value, label: o.title || o.label })) || []} />
                    </div>
                    <div className="flex gap-4">
                        <Button type="submit" disabled={submitting}>{submitting ? 'กำลังสร้าง...' : 'สร้างผู้ดูแลระบบ'}</Button>
                        <Button type="button" variant="outline" onClick={handleReset} disabled={submitting}>ยกเลิก</Button>
                    </div>
                    {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
                </div>
            </Block>
        </form>
    );
}
