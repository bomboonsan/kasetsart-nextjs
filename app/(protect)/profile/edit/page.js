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
const GET_USER_PROFILE = gql`
  query GetUserProfile($id: ID!) {
    usersPermissionsUser(id: $id) {
      data {
        id
        attributes {
          firstName
          lastName
          firstNameEn
          lastNameEn
          phone
          email
          academicPosition
          highDegree
        }
      }
    }
  }
`;

// GraphQL mutation to update user profile
const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($id: ID!, $data: UsersPermissionsUserInput!) {
    updateUsersPermissionsUser(id: $id, data: $data) {
      data {
        id
      }
    }
  }
`;

export default function ProfileEditPage() {
    const { data: session, status } = useSession();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        firstNameEn: '',
        lastNameEn: '',
        highDegree: '',
        academic_type: '',
        participation_type: '',
        email: '',
        phone: '',
        academicPosition: '',
        department: '',
        faculty: '',
        organization: '',
    });

    const userId = session?.user?.id;

    const { loading, error, data } = useQuery(GET_USER_PROFILE, {
        variables: { id: userId },
        skip: !userId,
    });

    const [updateProfile, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_USER_PROFILE, {
        onCompleted: () => {
            alert('Profile updated successfully!');
        },
        refetchQueries: [{ query: GET_USER_PROFILE, variables: { id: userId } }]
    });

    useEffect(() => {
        if (data && data.usersPermissionsUser && data.usersPermissionsUser.data) {
            const profile = data.usersPermissionsUser.data.attributes;
            const initialData = Object.keys(profile).reduce((acc, key) => {
                if (profile[key] !== null && profile[key] !== undefined) {
                    acc[key] = profile[key];
                }
                return acc;
            }, {});
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [data]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) return;

        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            firstNameEn: formData.firstNameEn,
            lastNameEn: formData.lastNameEn,
            phone: formData.phone,
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
        } catch (err) {
            console.error("Error updating profile:", err);
            alert(`Failed to update profile: ${err.message}`);
        }
    };

    if (status === "loading" || (loading && !data)) return <p>Loading...</p>;
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
                        <FieldInput label="ชื่อ" value={formData.firstName || ''} onChange={(value) => handleInputChange('firstName', value)} placeholder="กรุณาระบุชื่อ" />
                        <FieldInput label="นามสกุล" value={formData.lastName || ''} onChange={(value) => handleInputChange('lastName', value)} placeholder="กรุณาระบุนามสกุล" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldInput label="First Name" value={formData.firstNameEn || ''} onChange={(value) => handleInputChange('firstNameEn', value)} placeholder="First name in English" />
                        <FieldInput label="Last Name" value={formData.lastNameEn || ''} onChange={(value) => handleInputChange('lastNameEn', value)} placeholder="Last name in English" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldInput label="เบอร์ติดต่อ" value={formData.phone || ''} onChange={(value) => handleInputChange('phone', value)} placeholder="" />
                        <FieldInput label="อีเมล" type="email" value={formData.email || ''} onChange={(value) => handleInputChange('email', value)} placeholder="กรุณาระบุอีเมล" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldInput label="ตำแหน่งทางวิชาการ" value={formData.academicPosition || ''} onChange={(value) => handleInputChange('academicPosition', value)} placeholder="" />
                        <FieldInput label="วุฒิการศึกษาสูงสุด" value={formData.highDegree || ''} onChange={(value) => handleInputChange('highDegree', value)} placeholder="เช่น Ph.D., M.Sc., B.Eng." />
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