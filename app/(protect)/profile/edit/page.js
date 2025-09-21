"use client";
import Block from "@/components/layout/Block";
import FieldInput from "@/components/myui/FieldInput";
import FieldSelect from "@/components/myui/FieldSelect";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

const GET_ME = gql`
  query GetMe {
    me {
      documentId
    }
  }
`;

const GET_USER_PROFILE = gql`
  query GetUserProfile($documentId: ID!) {
    usersPermissionsUser(documentId: $documentId) {
      username
      email
      firstNameTH
      lastNameTH
      firstNameEN
      lastNameEN
      academicPosition
      highDegree
      telephoneNo
      avatar {
        url
      }
      academic_types {
        documentId
      }
    }
  }
`;

const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($id: ID!, $data: UsersPermissionsUserInput!) {
    updateUsersPermissionsUser(id: $id, data: $data) {
      __typename
    }
  }
`;

export default function ProfileEditPage() {
    const { data: session, status } = useSession();
    const [formData, setFormData] = useState({
        firstNameTH: '',
        lastNameTH: '',
        firstNameEN: '',
        lastNameEN: '',
        highDegree: '',
        academic_types: '',
        participation_type: '',
        email: '',
        telephoneNo: '',
        academicPosition: '',
        department: '',
        faculty: '',
        organization: '',
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);
    const [academicTypesOptions, setAcademicTypesOptions] = useState([]);

    const { data: meData, loading: meLoading } = useQuery(GET_ME, {
        skip: status !== 'authenticated',
    });
    const userDocumentId = meData?.me?.documentId;
    const userId = session?.user?.id;

    const { loading, error, data: profileData, refetch } = useQuery(GET_USER_PROFILE, {
        variables: { documentId: userDocumentId },
        skip: !userDocumentId,
    });

    const [updateProfile, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_USER_PROFILE);

    // Fetch Academic Types using REST API
    useEffect(() => {
        if (status === 'authenticated') {
            const fetchAcademicTypes = async () => {
                const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1338';
                const token = session?.jwt;
                try {
                    const res = await fetch(`${strapiUrl}/api/academic-types?populate=*`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    if (!res.ok) throw new Error('Failed to fetch academic types');
                    const json = await res.json();
                    setAcademicTypesOptions(json.data || []);
                } catch (e) {
                    console.error("Could not fetch academic types:", e);
                }
            };
            fetchAcademicTypes();
        }
    }, [status, session]);

    // Set initial form data once profile and options are loaded
    useEffect(() => {
        if (profileData && profileData.usersPermissionsUser && academicTypesOptions.length > 0) {
            const profile = profileData.usersPermissionsUser;
            const initialData = {};

            for (const key in profile) {
                if (key === '__typename' || key === 'avatar' || key === 'academic_types') continue;
                if (profile[key] !== null && profile[key] !== undefined) {
                    initialData[key] = profile[key];
                }
            }

            const selectedAcademicTypes = profile.academic_types;
            if (selectedAcademicTypes && selectedAcademicTypes.length > 0) {
                const selectedDocId = selectedAcademicTypes[0].documentId;
                const matchingType = academicTypesOptions.find(t => t.documentId === selectedDocId);
                if (matchingType) {
                    initialData.academic_types = matchingType.id;
                }
            }

            setFormData(prev => ({ ...prev, ...initialData }));

            if (profile.avatar && profile.avatar.url) {
                const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1338';
                setPreviewUrl(strapiUrl + profile.avatar.url);
            }
        }
    }, [profileData, academicTypesOptions]);

    const handleInputChange = (field, value) => {
        if (field === 'telephoneNo') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setFormData(prev => ({ ...prev, [field]: numericValue.slice(0, 10) }));
        } else if (field === 'firstNameEN' || field === 'lastNameEN') {
            const englishOnlyValue = value.replace(/[^a-zA-Z ]/g, '');
            setFormData(prev => ({ ...prev, [field]: englishOnlyValue }));
        } else if (field === 'firstNameTH' || field === 'lastNameTH') {
            const thaiOnlyValue = value.replace(/[^ก-๙ ]/g, '');
            setFormData(prev => ({ ...prev, [field]: thaiOnlyValue }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) return;

        let uploadedAvatarId = null;

        if (avatarFile) {
            const uploadFormData = new FormData();
            uploadFormData.append('files', avatarFile);

            const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1338';
            const token = session?.jwt;

            try {
                const uploadRes = await fetch(`${strapiUrl}/api/upload`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: uploadFormData,
                });

                if (!uploadRes.ok) {
                    const errorBody = await uploadRes.json();
                    throw new Error(errorBody.error?.message || 'Failed to upload image');
                }

                const uploadData = await uploadRes.json();
                uploadedAvatarId = uploadData[0].id;
            } catch (uploadError) {
                alert(`Error uploading image: ${uploadError.message}`);
                return;
            }
        }

        const payload = {
            firstNameTH: formData.firstNameTH,
            lastNameTH: formData.lastNameTH,
            firstNameEN: formData.firstNameEN,
            lastNameEN: formData.lastNameEN,
            telephoneNo: formData.telephoneNo,
            email: formData.email,
            academicPosition: formData.academicPosition,
            highDegree: formData.highDegree,
            academic_types: formData.academic_types,
        };

        if (uploadedAvatarId) {
            payload.avatar = uploadedAvatarId;
        }

        try {
            await updateProfile({
                variables: {
                    id: userId,
                    data: payload
                }
            });
            alert('Profile updated successfully!');
            refetch();
        } catch (err) {
            alert(`Failed to update profile: ${err.message}`);
        }
    };

    if (meLoading || (loading && !profileData)) return <p>Loading...</p>;
    if (error) return <p>Error loading profile: {error.message}</p>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Block>
                <h2 className="text-lg font-semibold mb-4">Profile Image</h2>
                <div className="flex items-center gap-6">
                    <Image
                        src={previewUrl || '/profile-placeholder.svg'}
                        alt="Profile Avatar"
                        width={96}
                        height={96}
                        className="rounded-full object-cover bg-gray-200"
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
            </Block>

            <Block>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold">Edit Profile</h2>
                    <Button type="submit" disabled={updateLoading}>
                        {updateLoading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
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
                        <FieldInput label="ตำแหน่งทางวิชาการ" value={formData.academicPosition || ''} onChange={(e) => handleInputChange('academicPosition', e.target.value)} placeholder="" />
                        <FieldInput label="วุฒิการศึกษาสูงสุด" value={formData.highDegree || ''} onChange={(e) => handleInputChange('highDegree', e.target.value)} placeholder="เช่น Ph.D., M.Sc., B.Eng." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldSelect label="ประเภทอาจารย์" value={formData.academic_types || ''} onChange={(value) => handleInputChange('academic_types', value)} placeholder="เลือกประเภทอาจารย์" options={academicTypesOptions.map(at => ({ value: at.id, label: at.name }))} />
                        {/* <FieldSelect label="ประเภทการเข้าร่วม" value={formData.participation_type} onChange={(value) => handleInputChange('participation_type', value)} options={[{ value: '', label: 'เลือกประเภทการเข้าร่วม' }, ...participationTypes.map(pt => ({ value: pt.id, label: pt.name }))]} /> */}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* <FieldSelect label="ภาควิชา" value={formData.department} onChange={(value) => handleInputChange('department', value)} options={[{ value: '', label: 'เลือกภาควิชา' }, ...departments.map(dep => ({ value: dep.id, label: dep.name }))]} /> */}
                        {/* <FieldSelect label="คณะ" value={formData.faculty} onChange={(value) => handleInputChange('faculty', value)} options={[{ value: '', label: 'เลือกคณะ' }, ...faculties.map(fac => ({ value: fac.id, label: fac.name }))]} /> */}
                        {/* <FieldSelect label="มหาวิทยาลัย/หน่วยงาน" value={formData.organization} onChange={(value) => handleInputChange('organization', value)} options={[{ value: '', label: 'เลือกมหาวิทยาลัย/หน่วยงาน' }, ...organizations.map(org => ({ value: org.id, label: org.name }))]} /> */}
                    </div>
                </div>
            </Block>
            {updateError && (
                <Block>
                    <p className="text-sm text-red-600">Error saving profile: {updateError.message}</p>
                </Block>
            )}
        </form>
    );
}