"use client";
// Components
import Block from "@/components/layout/Block";
import FieldInput from "@/components/myui/FieldInput";
import FieldSelect from "@/components/myui/FieldSelect";
import { Button } from "@/components/ui/button";
import Image from "next/image";
// Hooks
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client/react";
import toast from 'react-hot-toast';
// Custom Hooks
import { useFormOptions } from '@/hooks/useFormOptions';
// GraphQL Queries
import { GET_ME, GET_USER_PROFILE, UPDATE_USER_PROFILE, GET_PROFILE_OPTIONS } from '@/graphql/userQueries';
// Utils
import { formatToDigitsOnly, formatToEnglishOnly, formatToThaiOnly } from '@/utils/formatters';
import { API_BASE } from '@/lib/api-base';

const initialFormData = {
    firstNameTH: '',
    lastNameTH: '',
    firstNameEN: '',
    lastNameEN: '',
    highDegree: '',
    academic_types: '',
    email: '',
    telephoneNo: '',
    academicPosition: '',
    departments: '',
    faculties: '',
    organizations: '',
    participation: '',
    education: ''
}

const initialEducationItem = {
    level: '',
    institution: '',
    field: '',
    year: ''
}

export default function ProfileEditPage() {
    const { data: session, status } = useSession();
    const [formData, setFormData] = useState(initialFormData);
    const [selectData, setSelectData] = useState({});
    const [education, setEducation] = useState([{ ...initialEducationItem }]);

    const [isAdminSuperAdmin, setIsAdminSuperAdmin] = useState(false);

    const { options, loading: optionsLoading, error: optionsError } = useFormOptions(session);

    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);
    const isFormInitialized = useRef(false);
    const [password, setPassword] = useState('');

    const { data: meData, loading: meLoading } = useQuery(GET_ME, {
        skip: status !== 'authenticated',
    });
    const userDocumentId = meData?.me?.documentId;
    const userId = session?.user?.id;

    const { loading, error, data: profileData, refetch } = useQuery(GET_USER_PROFILE, {
        variables: { documentId: userDocumentId },
        skip: !userDocumentId,
    });

    const { loading: optionsXLoading, error: optionsXError, data: optionsData } = useQuery(GET_PROFILE_OPTIONS);

    useEffect(() => {
        if (optionsData) {
            setSelectData({
                departments: optionsData.departments,
                faculties: optionsData.faculties,
                organizations: optionsData.organizations,
            });
        }
    }, [optionsData]);

    const [updateProfile, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_USER_PROFILE);

    // Set initial form data once profile and options are loaded
    useEffect(() => {
        // ถ้าข้อมูลยังไม่ครบ หรือถ้าฟอร์มถูกเซ็ตค่าไปแล้ว ให้ออกจาก function ทันที
        if (!profileData?.usersPermissionsUser || optionsLoading || isFormInitialized.current) {
            return;
        }
        const profile = profileData.usersPermissionsUser;
        let initialData = {};

        for (const key in profile) {
            if (key === '__typename' || key === 'avatar') continue;
            if (profile[key] !== null && profile[key] !== undefined) {
                initialData[key] = profile[key];
            }
        }
        initialData.academic_types = profile.academic_types[0]?.documentId || '';

        if ((initialData.academic_types.length == 0 && initialData.role.name == "Admin") || (initialData.academic_types.length == 0 && initialData.role.name == "Super Admin")) {
            setIsAdminSuperAdmin(true);
        }

        setFormData(prev => ({ ...prev, ...initialData }));

        // Initialize education data
        if (profile.education) {
            try {
                let educationData;

                // Check if education is already an object/array or a JSON string
                if (typeof profile.education === 'string') {
                    educationData = JSON.parse(profile.education);
                } else if (Array.isArray(profile.education)) {
                    educationData = profile.education;
                } else if (typeof profile.education === 'object') {
                    // If it's an object but not an array, wrap it in an array
                    educationData = [profile.education];
                }

                if (Array.isArray(educationData) && educationData.length > 0) {
                    setEducation(educationData);
                }
            } catch (error) {
            }
        }



        if (profile.avatar && profile.avatar.url) {
            const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1338';
            setPreviewUrl(strapiUrl + profile.avatar.url);
        }

        isFormInitialized.current = true; // Mark form as initialized
    }, [profileData, optionsLoading]);

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

    // Education management functions
    const addEducation = () => {
        setEducation(prev => [...prev, { ...initialEducationItem }]);
    };

    const removeEducation = (index) => {
        if (education.length > 1) {
            setEducation(prev => prev.filter((_, i) => i !== index));
        }
    };

    const updateEducation = (index, field, value) => {
        setEducation(prev => prev.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleReset = () => {
        window.location.reload();
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) return;

        let uploadedAvatarId = null;

        if (avatarFile) {
            const uploadFormData = new FormData();
            uploadFormData.append('files', avatarFile);

            const token = session?.jwt;

            try {
                const uploadRes = await fetch(`${API_BASE}/api/upload`, {
                    method: 'POST',
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    body: uploadFormData,
                });

                if (!uploadRes.ok) {
                    const errorText = await uploadRes.text().catch(() => uploadRes.statusText);
                    throw new Error(`Failed to upload image: ${uploadRes.status} ${errorText}`);
                }

                const uploadData = await uploadRes.json();
                if (!uploadData || !Array.isArray(uploadData) || uploadData.length === 0) {
                    throw new Error('No file uploaded');
                }
                uploadedAvatarId = uploadData[0].id;
            } catch (uploadError) {
                console.error('Upload error:', uploadError);
                toast.error(`Error uploading image: ${uploadError.message}`);
                return;
            }
        }

        const extractDocumentId = (value) => {
            if (!value || (Array.isArray(value) && value.length === 0)) {
                return null;
            }
            if (Array.isArray(value)) {
                return extractDocumentId(value[0]);
            }
            if (typeof value === 'object') {
                return value.documentId || value.value || null;
            }
            return value;
        };

        const resolveRelationId = (value, optionList) => {
            const documentId = extractDocumentId(value);
            if (!documentId || !Array.isArray(optionList)) {
                return null;
            }
            const match = optionList.find((item) => item.value === documentId || item.documentId === documentId);
            return match?.id || null;
        };

        const academicTypeId = resolveRelationId(formData.academic_types, options.academicTypes);
        const departmentId = resolveRelationId(formData.departments, options.departments);
        const facultyId = resolveRelationId(formData.faculties, options.faculties);
        const organizationId = resolveRelationId(formData.organizations, options.organizations);

        const payload = {
            firstNameTH: formData.firstNameTH,
            lastNameTH: formData.lastNameTH,
            firstNameEN: formData.firstNameEN,
            lastNameEN: formData.lastNameEN,
            telephoneNo: formData.telephoneNo,
            email: formData.email,
            academicPosition: formData.academicPosition,
            highDegree: formData.highDegree,
            academic_types: academicTypeId ? [academicTypeId] : null,
            participation: formData.participation,
            departments: departmentId ? [departmentId] : null,
            faculties: facultyId ? [facultyId] : null,
            organizations: organizationId ? [organizationId] : null,
            education: JSON.stringify(education.filter(edu =>
                edu.level || edu.institution || edu.field || edu.year
            ))
        };

        if (uploadedAvatarId) {
            payload.avatar = uploadedAvatarId;
        }
        if (password && password.length > 0) {
            payload.password = password;
        }

        try {
            await updateProfile({
                variables: {
                    id: userId,
                    data: payload
                }
            });
            toast.success('Profile updated successfully!');
            refetch();
        } catch (err) {
            toast.error(`Failed to update profile: ${err.message}`);
        }
    };

    if (meLoading || (loading && !profileData) || optionsLoading || optionsXLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading profile: {error.message}</p>;


    // if (!formData) {
    //     return <p>No profile data found.</p>;
    // }

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
                    <Button type="button" onClick={() => fileInputRef.current.click()}>
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
                    {!isAdminSuperAdmin && (
                        <>
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
                        </>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FieldSelect label="เลือกภาควิชา" value={formData.departments[0]?.documentId ? formData.departments[0].documentId : formData.departments} onChange={(value) => handleInputChange('departments', value)} placeholder="เลือกภาควิชา" options={selectData.departments.map(d => ({ value: d.documentId, label: d.title }))} />
                        <FieldSelect label="คณะ" value={formData.faculties[0]?.documentId ? formData.faculties[0].documentId : formData.faculties} onChange={(value) => handleInputChange('faculties', value)} placeholder="เลือกคณะ" options={selectData.faculties.map(f => ({ value: f.documentId, label: f.title }))} />
                        <FieldSelect label="มหาวิทยาลัย/หน่วยงาน" value={formData.organizations[0]?.documentId ? formData.organizations[0].documentId : formData.organizations} onChange={(value) => handleInputChange('organizations', value)} placeholder="เลือกมหาวิทยาลัย/หน่วยงาน" options={selectData.organizations.map(o => ({ value: o.documentId, label: o.title }))} />
                    </div>
                </div>
            </Block>
            {!isAdminSuperAdmin && (
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
                            <Button type="button" variant="secondary" onClick={addEducation}>
                                เพิ่มวุฒิการศึกษา
                            </Button>
                        </div>
                    </div>
                </Block>
            )}
            <Block>
                <div className="p-6">
                    <h2 className='text-lg text-gray-900'>เปลี่ยนรหัสผ่าน</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <FieldInput label="รหัสผ่านใหม่" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="เว้นว่างถ้าไม่ต้องการเปลี่ยน" />
                        <div />
                    </div>
                </div>
            </Block>
            <div className="flex gap-4 mt-4 justify-end">
                <Button type="submit" disabled={updateLoading}>
                    {updateLoading ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset} disabled={updateLoading}>
                    ยกเลิก
                </Button>
            </div>
            {updateError && (
                <Block>
                    <p className="text-sm text-red-600">Error saving profile: {updateError.message}</p>
                </Block>
            )}
        </form>
    );
}
