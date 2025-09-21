"use client";
import Block from "@/components/layout/Block";
import FieldInput from "@/components/myui/FieldInput";
import FieldSelect from "@/components/myui/FieldSelect";

import { useState } from "react";

export default function ProfileEditPage() {
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
        nameEn: '',
        academicPosition: '',
        department: '',
        faculty: '',
        organization: '',
    });
    return (
        <div className="space-y-6">
            <Block>
                <h2 className="text-lg font-semibold">Edit Profile</h2>
                <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldInput label="ชื่อ" value={formData.firstName} onChange={(value) => handleInputChange('firstName', value)} placeholder="กรุณาระบุชื่อ" />
                        <FieldInput label="นามสกุล" value={formData.lastName} onChange={(value) => handleInputChange('lastName', value)} placeholder="กรุณาระบุนามสกุล" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldInput label="First Name" value={formData.firstNameEn} onChange={(value) => handleInputChange('firstNameEn', value)} placeholder="First name in English" />
                        <FieldInput label="Last Name" value={formData.lastNameEn} onChange={(value) => handleInputChange('lastNameEn', value)} placeholder="Last name in English" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldInput label="เบอร์ติดต่อ" value={formData.phone} onChange={(value) => handleInputChange('phone', value)} placeholder="" />
                        <FieldInput label="อีเมล" type="email" value={formData.email} onChange={(value) => handleInputChange('email', value)} placeholder="กรุณาระบุอีเมล" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldInput label="ตำแหน่งทางวิชาการ" value={formData.academicPosition} onChange={(value) => handleInputChange('academicPosition', value)} placeholder="" />
                        <FieldInput label="HighDegree" value={formData.highDegree} onChange={(value) => handleInputChange('highDegree', value)} placeholder="เช่น Ph.D., M.Sc., B.Eng." />
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
            <Block>
                <p className="text-sm text-gray-600">Make changes to your profile information.</p>
            </Block>
        </div>
    );
}
