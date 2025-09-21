"use client";
import Block from "@/components/layout/Block";
import FieldInput from "@/components/myui/FieldInput";
import FieldSelect from "@/components/myui/FieldSelect";
import { Button } from "@/components/ui/button";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

// GraphQL query to get user profile
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
        academic_type: '',
        participation_type: '',
        email: '',
        telephoneNo: '',
        academicPosition: '',
        department: '',
        faculty: '',
        organization: '',
    });

    // 1. Get documentId from 'me' query
    const { data: meData, loading: meLoading } = useQuery(GET_ME, {
        skip: status !== 'authenticated',
    });
    const userDocumentId = meData?.me?.documentId;
    const userId = session?.user?.id;

    // 2. Get full user profile using the documentId
    const { loading, error, data: profileData, refetch } = useQuery(GET_USER_PROFILE, {
        variables: { documentId: userDocumentId },
        skip: !userDocumentId, // Skip if we don't have documentId yet
    });

    const [updateProfile, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_USER_PROFILE);

    useEffect(() => {
        if (profileData && profileData.usersPermissionsUser) {
            const profile = profileData.usersPermissionsUser;
            const initialData = Object.keys(profile).reduce((acc, key) => {
                if (profile[key] !== null && profile[key] !== undefined) {
                    acc[key] = profile[key];
                }
                return acc;
            }, {});
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [profileData]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) return;

        const payload = {
            firstNameTH: formData.firstNameTH,
            lastNameTH: formData.lastNameTH,
            firstNameEN: formData.firstNameEN,
            lastNameEN: formData.lastNameEN,
            telephoneNo: formData.telephoneNo,
            email: formData.email,
            academicPosition: formData.academicPosition,
            highDegree: formData.highDegree,
        };

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
                        {/* <FieldSelect label="ประเภทอาจารย์" value={formData.academic_type} onChange={(value) => handleInputChange('academic_type', value)} options={[{ value: '', label: 'เลือกประเภทอาจารย์' }, ...academicTypes.map(at => ({ value: at.id, label: at.name }))]} /> */}
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