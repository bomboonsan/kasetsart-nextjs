'use client'
import React from 'react';
import { useEffect, useMemo, useState, useRef } from 'react'
import { useSession } from "next-auth/react";
import Block from '../layout/Block';
import FormInput from '@/components/myui/FormInput';
import FormRadio from '@/components/myui/FormRadio';
import FormTextarea from '@/components/myui/FormTextarea';
import FormDateSelect from '../myui/FormDateSelect';
import FormSelect from '../myui/FormSelect';
import Partners from "../form/Partners"
import FileUploadField from './FileUploadField';
import { Button } from '../ui/button';
import { PROJECT_FORM_INITIAL, researchKindOptions, fundTypeOptions, subFundType1, subFundType2, subFundType3, subFundType4, fundNameOptions } from '@/data/project';
import { GET_PROJECT_OPTIONS } from '@/graphql/optionForm';
import { CREATE_PROJECT } from '@/graphql/formQueries';
import { useQuery, useMutation } from "@apollo/client/react";
export default function ProjectForm({ initialData, onSubmit }) {
    const { data: session, status } = useSession();
    const [formData, setFormData] = useState(PROJECT_FORM_INITIAL);
    const [fundSubTypeOptions, setFundSubTypeOptions] = useState([]);
    const [icTypesOptions, setIcTypesOptions] = useState([]);
    const [impactsOptions, setImpactsOptions] = useState([]);
    const [sdgsOptions, setSdgsOptions] = useState([]);
    const [departmentsOptions, setDepartmentsOptions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // เก็บ attachments เดิมเพื่อเช็คความเปลี่ยนแปลงเวลา update
    const originalAttachmentIdsRef = useRef([]);

    const extractAttachmentIds = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr
            .filter(a => a && (a.id || a.documentId))
            .map(a => String(a.documentId || a.id));
    };

    const [createProject] = useMutation(CREATE_PROJECT, {
        context: {
            headers: {
                Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
            }
        },
        onCompleted: (data) => {
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
        if (field === 'partners') {
            console.log('Partners updated in ProjectForm:', value);
        }
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
            // derive users_permissions_users (manyToMany) from partners that are internal and linked to a user
            const users_permissions_users = Array.isArray(formData.partners)
                ? formData.partners
                    .filter(p => p.isInternal && (p.userID || p.User?.documentId || p.User?.id))
                    .map(p => {
                        return p.userID || p.User?.documentId || p.User?.id;
                    })
                    .filter(Boolean)
                : [];

            // Prepare attachments data - extract file IDs from uploaded files as strings
            const attachmentIds = Array.isArray(formData.attachments)
                ? formData.attachments
                    .filter(attachment => attachment && (attachment.documentId || attachment.id))
                    .map(attachment => String(attachment.documentId || attachment.id))
                : [];
        
            console.log('Prepared attachment IDs:', attachmentIds); // Debug log

            const currentAttachmentIds = attachmentIds;
            const originalIdsSorted = [...originalAttachmentIdsRef.current].sort();
            const currentIdsSorted = [...currentAttachmentIds].sort();
            const attachmentsChanged = JSON.stringify(originalIdsSorted) !== JSON.stringify(currentIdsSorted);

            const projectData = {
                fiscalYear: parseInt(formData.fiscalYear) || null,
                projectType: formData.projectType || null,
                projectMode: formData.projectMode || null,
                subProjectCount: formData.subProjectCount || null,
                nameTH: formData.nameTH.trim() || null,
                nameEN: formData.nameEN.trim() || null,
                isEnvironmentallySustainable: formData.isEnvironmentallySustainable || null,
                durationStart: formData.durationStart || null,
                durationEnd: formData.durationEnd || null,
                researchKind: formData.researchKind || null,
                fundType: formData.fundType || null,
                fundSubType: formData.fundSubType || null,
                fundName: formData.fundName || null,
                budget: parseInt(formData.budget) || null,
                keywords: formData.keywords || null,
                // Handle relations - need to pass documentIds as arrays
                departments: formData.departments ? [formData.departments] : [],
                ic_types: formData.icTypes ? [formData.icTypes] : [],
                impacts: formData.impact ? [formData.impact] : [],
                sdgs: formData.sdg ? [formData.sdg] : [],
                partners: formData.partners || [],
                attachments: attachmentIds.length ? attachmentIds : [],
                users_permissions_users: users_permissions_users.length ? users_permissions_users : undefined
            };


            // Remove null values to avoid issues
            Object.keys(projectData).forEach(key => {
                if (projectData[key] === null || projectData[key] === "") {
                    delete projectData[key];
                }
            });


            // Sanitize projectData to avoid sending BigInt values (GraphQL cannot serialize BigInt)
            const sanitize = (value) => {
                if (typeof value === 'bigint') return value.toString()
                if (Array.isArray(value)) return value.map(sanitize)
                if (value && typeof value === 'object') {
                    const out = {}
                    Object.keys(value).forEach(k => {
                        out[k] = sanitize(value[k])
                    })
                    return out
                }
                return value
            }

            if (initialData && !attachmentsChanged) {
                delete projectData.attachments;
            }

            const safeProjectData = sanitize(projectData)

            if (onSubmit) {
                await onSubmit(safeProjectData);
            } else {
                await createProject({
                    variables: {
                        data: safeProjectData
                    }
                });
            }
        } catch (error) {
            console.error('Submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        console.log(formData);
    }, [formData]);

    // hydrate when editing
    useEffect(() => {
        if (initialData) {
            const hydrated = {
                ...PROJECT_FORM_INITIAL,
                ...initialData,
                // map relations to expected single select values
                icTypes: initialData.ic_types?.[0]?.documentId ?? initialData.icTypes ?? "",
                impact: initialData.impacts?.[0]?.documentId ?? initialData.impact ?? "",
                sdg: initialData.sdgs?.[0]?.documentId ?? initialData.sdg ?? "",
                departments: initialData.departments?.[0]?.documentId ?? initialData.departments ?? "",
            };
            setFormData(hydrated);
            originalAttachmentIdsRef.current = extractAttachmentIds(hydrated.attachments);
        }
    }, [initialData]);

    useEffect(() => {
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
            setIcTypesOptions(projectOptions.icTypes.map(ic => ({ value: ic.documentId, label: ic.name })));
            setImpactsOptions(projectOptions.impacts.map(imp => ({ value: imp.documentId, label: imp.name })));
            setSdgsOptions(projectOptions.sdgs.map(sdg => ({ value: sdg.documentId, label: sdg.name })));
            setDepartmentsOptions(projectOptions.departments.map(dep => ({ value: dep.documentId, label: dep.title }))); 
        }
    }, [projectOptions]);
    if (projectOptionsLoading) return <p>Loading...</p>;


    // console.log('projectOptions', projectOptions);

    if(!formData) return <p>Loading form...</p>

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
                    <FormTextarea id="nameTH" label="ชื่อแผนงานวิจัยหรือชุดโครงการวิจัย/โครงการวิจัย (ไทย)" value={formData.nameTH} onChange={(e) => handleInputChange('nameTH', e.target.value)} placeholder="" rows={5} />
                    <FormTextarea id="nameEN" label="ชื่อแผนงานวิจัยหรือชุดโครงการวิจัย/โครงการวิจัย (อังกฤษ)" value={formData.nameEN} onChange={(e) => handleInputChange('nameEN', e.target.value)} placeholder="" rows={5} />
                    <FormRadio id="isEnvironmentallySustainable" label="" value={formData.isEnvironmentallySustainable} onChange={(e) => handleInputChange('isEnvironmentallySustainable', e.target.value)} options={[
                        { value: '0', label: 'เกี่ยวข้อง กับสิ่งแวดล้อมและความยั่งยืน' },
                        { value: '1', label: 'ไม่เกี่ยวข้อง กับสิ่งแวดล้อมและความยั่งยืน' },
                    ]} />
                    <FormDateSelect durationStart={formData.durationStart} durationEnd={formData.durationEnd} durationStartChange={(field, value) => handleInputChange(field, value)} durationEndChange={(field, value) => handleInputChange(field, value)} noDay={false}>
                        ระยะเวลาการทำวิจัย{" "}
                        <span className="text-blue-700">(ปี พ.ศ. 4 หลัก)</span>
                        <span className="text-red-500 ml-1">*</span>
                    </FormDateSelect>
                    {/* <FormTextarea id="responsibleOrganization" label="หน่วยงานหลักที่รับผิดชอบโครงการวิจัย (หน่วยงานที่ขอทุน)" value={formData.responsibleOrganization} onChange={(e) => handleInputChange('responsibleOrganization', e.target.value)} placeholder="" rows={5} /> */}
                    <FormSelect id="departments" label="หน่วยงานหลักที่รับผิดชอบโครงการวิจัย (หน่วยงานที่ขอทุน)" value={formData.departments ?? ""} placeholder="เลือกหน่วยงาน" onChange={(val) => handleInputChange('departments', val)} options={departmentsOptions} />
                    <FormSelect id="researchKind" label="ประเภทงานวิจัย" value={formData.researchKind ?? ""} placeholder="เลือกประเภทงานวิจัย" onChange={(val) => handleInputChange('researchKind', val)} options={researchKindOptions} />
                    <FormSelect id="fundType" label="ประเภทแหล่งทุน" value={formData.fundType ?? ""} placeholder="เลือกประเภทแหล่งทุน" onChange={(val) => handleInputChange('fundType', val)} options={fundTypeOptions} />
                    <FormSelect id="fundSubType" label=" " value={formData.fundSubType ?? ""} placeholder="เลือกประเภทแหล่งทุน" onChange={(val) => handleInputChange('fundSubType', val)} options={fundSubTypeOptions} />
                    <FormSelect id="fundName" label="ชื่อแหล่งทุน" value={formData.fundName ?? ""} placeholder="ชื่อแหล่งทุน" onChange={(val) => handleInputChange('fundName', val)} options={fundNameOptions} />
                    <FormTextarea label=" " value={formData.fundName} readOnly disabled />
                    <FormInput id="budget" type='number' label="งบวิจัย" value={formData.budget} placeholder="0" onChange={(e) => handleInputChange('budget', e.target.value)} />
                    <FormTextarea id="keywords" label="คำสำคัญ (คั่นระหว่างคำด้วยเครื่องหมาย “;” เช่น ข้าว; พืช; อาหาร)" value={formData.keywords} onChange={(e) => handleInputChange('keywords', e.target.value)} placeholder="" rows={5} />
                    <FormSelect id="icTypes" label="IC Types" value={formData.icTypes ?? ""} placeholder="เลือก IC Types" onChange={(val) => handleInputChange('icTypes', val)} options={icTypesOptions} />
                    <FormSelect id="impact" label="Impact" value={formData.impact ?? ""} placeholder="เลือก Impact" onChange={(val) => handleInputChange('impact', val)} options={impactsOptions} />
                    <FormSelect id="sdgs" label="SDG" value={formData.sdg ?? ""} placeholder="เลือก SDG" onChange={(val) => handleInputChange('sdg', val)} options={sdgsOptions} />
                    <FileUploadField
                        label="เอกสารแนบ"
                        value={formData.attachments || []}
                        onFilesChange={(files) => handleInputChange('attachments', files)}
                    />
                    <Partners data={formData.partners} onChange={(partners) => handleInputChange('partners', partners)} />
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
