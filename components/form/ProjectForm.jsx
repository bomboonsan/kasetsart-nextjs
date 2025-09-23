'use client'
import React from 'react';
import { useEffect, useMemo, useState } from 'react'
import { useSession } from "next-auth/react";
import Block from '../layout/Block';
import FormInput from '@/components/myui/FormInput';
import FormRadio from '@/components/myui/FormRadio';
import FormTextarea from '@/components/myui/FormTextarea';
import FormDateSelect from '../myui/FormDateSelect';
import FormSelect from '../myui/FormSelect';
import { Button } from '../ui/button';
import { PROJECT_FORM_INITIAL, researchKindOptions, fundTypeOptions, subFundType1, subFundType2, subFundType3, subFundType4, fundNameOptions } from '@/data/project';
import { GET_PROJECT_OPTIONS } from '@/graphql/optionForm';
import { CREATE_PROJECT } from '@/graphql/formQueries';
import { useQuery, useMutation } from "@apollo/client/react";
export default function ProjectForm({ props }) {
    const { data: session, status } = useSession();
    const [formData, setFormData] = useState(PROJECT_FORM_INITIAL);
    const [fundSubTypeOptions, setFundSubTypeOptions] = useState([]);
    const [icTypesOptions, setIcTypesOptions] = useState([]);
    const [impactsOptions, setImpactsOptions] = useState([]);
    const [sdgsOptions, setSdgsOptions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [createProject] = useMutation(CREATE_PROJECT, {
        context: {
            headers: {
                Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
            }
        },
        onCompleted: (data) => {
            console.log('Project created successfully:', data);
            alert('บันทึกโครงการสำเร็จแล้ว!');
            // Reset form or redirect as needed
            setFormData(PROJECT_FORM_INITIAL);
        },
        onError: (error) => {
            console.error('Error creating project:', error);
            alert('เกิดข้อผิดพลาดในการบันทึก: ' + error.message);
        }
    });

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!session?.jwt) {
            alert('กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล');
            return;
        }

        // Basic validation
        if (!formData.nameTH.trim()) {
            alert('กรุณากรอกชื่อโครงการภาษาไทย');
            return;
        }

        if (!formData.fiscalYear) {
            alert('กรุณากรอกปีงบประมาณ');
            return;
        }

        setIsSubmitting(true);
        
        try {
            // Prepare data for submission based on Strapi schema
            const projectData = {
                fiscalYear: parseInt(formData.fiscalYear) || null,
                projectType: parseInt(formData.projectType) || null,
                projectMode: parseInt(formData.projectMode) || null,
                subProjectCount: parseInt(formData.subProjectCount) || null,
                nameTH: formData.nameTH.trim() || null,
                nameEN: formData.nameEN.trim() || null,
                isEnvironmentallySustainable: parseInt(formData.isEnvironmentallySustainable) || null,
                durationStart: formData.durationStart || null,
                durationEnd: formData.durationEnd || null,
                researchKind: formData.researchKind || null,
                fundType: formData.fundType || null,
                fundSubType: formData.fundSubType || null,
                fundName: formData.fundName || null,
                budget: parseInt(formData.budget) || null,
                keywords: formData.keywords || null,
                // Handle relations - need to pass documentIds as arrays
                ic_types: formData.icTypes ? [formData.icTypes] : [],
                impacts: formData.impact ? [formData.impact] : [],
                sdgs: formData.sdg ? [formData.sdg] : []
            };

            // Remove null values to avoid issues
            Object.keys(projectData).forEach(key => {
                if (projectData[key] === null || projectData[key] === "") {
                    delete projectData[key];
                }
            });

            console.log('Submitting project data:', projectData);

            await createProject({
                variables: {
                    data: projectData
                }
            });
        } catch (error) {
            console.error('Submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        console.log(formData);
    }, [formData]);

    useEffect(() => {
        console.log('fundType changed:', formData.fundType);
        if (formData.fundType == "12") {
            setFundSubTypeOptions(subFundType1);
        } else if (formData.fundType == "11") {
            setFundSubTypeOptions(subFundType2);
        } else if (formData.fundType == "13") {
            setFundSubTypeOptions(subFundType3);
        } else if (formData.fundType == "10") {
            setFundSubTypeOptions(subFundType4);
        }
    }, [formData.fundType]);

    const { data: projectOptions, loading: projectOptionsLoading } = useQuery(GET_PROJECT_OPTIONS, {
        skip: status !== 'authenticated',
        context: {
            headers: {
                Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
            }
        }
    });
    useEffect(() => {
        if (projectOptions) {
            console.log('Fetched project options:', projectOptions);
            setIcTypesOptions(projectOptions.icTypes.map(ic => ({ value: ic.documentId, label: ic.name })));
            setImpactsOptions(projectOptions.impacts.map(imp => ({ value: imp.documentId, label: imp.name })));
            setSdgsOptions(projectOptions.sdgs.map(sdg => ({ value: sdg.documentId, label: sdg.name })));
        }
    }, [projectOptions]);
    if (projectOptionsLoading) return <p>Loading...</p>;

    console.log('projectOptions', projectOptions);

    return (
        <>
            <Block>
                <div className="inputGroup">
                    <FormInput id="fiscalYear" label="ปีงบประมาณ" value={formData.fiscalYear} placeholder="กรอกปีงบประมาณ" onChange={(e) => handleInputChange('fiscalYear', e.target.value)} />
                    <FormRadio id="projectType" label="ประเภทโครงการ" value={formData.projectType} onChange={(e) => handleInputChange('projectType', e.target.value)} options={[
                        { value: '0', label: 'โครงการวิจัย' },
                        { value: '1', label: 'โครงการพัฒนาวิชาการประเภทงานวิจัย' },
                    ]} />
                    <FormRadio id="projectMode" label="ลักษณะโครงการวิจัย" value={formData.projectMode} onChange={(e) => handleInputChange('projectMode', e.target.value)} options={[
                        { value: '0', label: 'โครงการวิจัยเดี่ยว' },
                        { value: '1', label: 'แผนงานวิจัย หรือชุดโครงการวิจัย' },
                    ]} />
                    <FormInput id="subProjectCount" type='number' label="จำนวนโครงการย่อย" value={formData.subProjectCount} placeholder="กรอกจำนวนโครงการย่อย" onChange={(e) => handleInputChange('subProjectCount', e.target.value)} />
                    {/* <FormInput id="project-name" label="ชื่อโครงการ" value="" placeholder="กรอกชื่อโครงการ" /> */}
                    <FormTextarea id="nameTH" label="ชื่อแผนงานวิจัยหรือชุดโครงการวิจัย/โครงการวิจัย (ไทย)" onChange={(e) => handleInputChange('nameTH', e.target.value)} placeholder="" rows={5} />
                    <FormTextarea id="nameEN" label="ชื่อแผนงานวิจัยหรือชุดโครงการวิจัย/โครงการวิจัย (อังกฤษ)" onChange={(e) => handleInputChange('nameEN', e.target.value)} placeholder="" rows={5} />
                    <FormRadio id="isEnvironmentallySustainable" label="" value={formData.isEnvironmentallySustainable} onChange={(e) => handleInputChange('isEnvironmentallySustainable', e.target.value)} options={[
                        { value: '0', label: 'เกี่ยวข้อง กับสิ่งแวดล้อมและความยั่งยืน' },
                        { value: '1', label: 'ไม่เกี่ยวข้อง กับสิ่งแวดล้อมและความยั่งยืน' },
                    ]} />
                    <FormDateSelect durationStart={formData.durationStart} durationEnd={formData.durationEnd} durationStartChange={(field, value) => handleInputChange(field, value)} durationEndChange={(field, value) => handleInputChange(field, value)} noDay >
                        ระยะเวลาการทำวิจัย{" "}
                        <span className="text-blue-700">(ปี พ.ศ. 4 หลัก)</span>
                        <span className="text-red-500 ml-1">*</span>
                    </FormDateSelect>
                    <FormTextarea id="responsibleOrganization" label="หน่วยงานหลักที่รับผิดชอบโครงการวิจัย (หน่วยงานที่ขอทุน)" value={formData.responsibleOrganization} onChange={(e) => handleInputChange('responsibleOrganization', e.target.value)} placeholder="" rows={5} />
                    <FormSelect id="researchKind" label="ประเภทงานวิจัย" value={formData.researchKind ?? ""} placeholder="เลือกประเภทงานวิจัย" onChange={(val) => handleInputChange('researchKind', val)} options={researchKindOptions} />
                    <FormSelect id="fundType" label="ประเภทแหล่งทุน" value={formData.fundType ?? ""} placeholder="เลือกประเภทแหล่งทุน" onChange={(val) => handleInputChange('fundType', val)} options={fundTypeOptions} />
                    <FormSelect id="fundSubType" label=" " value={formData.fundSubType ?? ""} placeholder="เลือกประเภทแหล่งทุน" onChange={(val) => handleInputChange('fundSubType', val)} options={fundSubTypeOptions} />
                    <FormSelect id="fundName" label="ชื่อแหล่งทุน" value={formData.fundName ?? ""} placeholder="ชื่อแหล่งทุน" onChange={(val) => handleInputChange('fundName', val)} options={fundNameOptions} />
                    <FormTextarea label=" " value={formData.fundName} readOnly disabled />
                    <FormInput id="budget" type='number' label="งบวิจัย" value={formData.budget} placeholder="0" onChange={(e) => handleInputChange('budget', e.target.value)} />
                    <FormTextarea id="keywords" label="คำสำคัญ (คั่นระหว่างคำด้วยเครื่องหมาย “;” เช่น ข้าว; พืช; อาหาร)" onChange={(e) => handleInputChange('keywords', e.target.value)} placeholder="" rows={5} />
                    <FormSelect id="icTypes" label="IC Types" value={formData.icTypes ?? ""} placeholder="เลือก IC Types" onChange={(val) => handleInputChange('icTypes', val)} options={icTypesOptions} />
                    <FormSelect id="impact" label="Impact" value={formData.impact ?? ""} placeholder="เลือก Impact" onChange={(val) => handleInputChange('impact', val)} options={impactsOptions} />
                    <FormSelect id="sdgs" label="SDG" value={formData.sdg ?? ""} placeholder="เลือก SDG" onChange={(val) => handleInputChange('sdg', val)} options={sdgsOptions} />
                </div>
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
            </Block>
        </>
    );
}
