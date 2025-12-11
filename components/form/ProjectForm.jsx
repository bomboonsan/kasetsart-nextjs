"use client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import React from "react";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import Block from "../layout/Block";
import FormInput from "@/components/myui/FormInput";
import FormRadio from "@/components/myui/FormRadio";
import FormTextarea from "@/components/myui/FormTextarea";
import FormDateSelect from "../myui/FormDateSelect";
import FormSelect from "../myui/FormSelect";
import FormMultiSelect from "../myui/FormMultiSelect";
import Partners from "../form/Partners";
import FileUploadField from "./FileUploadField";
import { Button } from "../ui/button";
import {
  PROJECT_FORM_INITIAL,
  researchKindOptions,
  fundTypeOptions,
  subFundType1,
  subFundType2,
  subFundType3,
  subFundType4,
  fundNameOptions,
} from "@/data/project";
import { GET_PROJECT_OPTIONS } from "@/graphql/optionForm";
import { CREATE_PROJECT, UPDATE_PROJECT } from "@/graphql/formQueries";

import { extractInternalUserIds } from "@/utils/partners";

// Add BigInt serialization support for JSON.stringify
if (typeof BigInt !== "undefined") {
  // @ts-ignore
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };
}

// Move utility functions outside component to prevent re-creation
const normalizeId = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric >= 0) {
    return String(numeric);
  }
  const str = String(value).trim();
  return str.length ? str : null;
};

const parseIntegerOrNull = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const stripTypenameDeep = (input) => {
  // Handle null explicitly
  if (input === null) {
    return null;
  }
  // Handle undefined
  if (input === undefined) {
    return undefined;
  }
  // Handle BigInt - convert to string
  if (typeof input === "bigint") {
    return input.toString();
  }
  // Handle arrays
  if (Array.isArray(input)) {
    return input.map(stripTypenameDeep).filter((item) => item !== undefined);
  }
  // Handle objects
  if (typeof input === "object") {
    return Object.entries(input).reduce((acc, [key, val]) => {
      if (key === "__typename") return acc;
      const sanitized = stripTypenameDeep(val);
      // Keep null values but remove undefined
      if (sanitized !== undefined) {
        acc[key] = sanitized;
      }
      return acc;
    }, {});
  }
  // Handle primitives (string, number, boolean)
  return input;
};

const extractAttachmentIds = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((a) => a && typeof a === "object" && (a.documentId || a.id))
    .map((a) => normalizeId(a.documentId ?? a.id))
    .filter((id) => {
      // Accept both numeric IDs and string UUIDs (Strapi v5 uses UUID strings)
      if (!id || id.length === 0) return false;
      const numericId = Number(id);
      const isNumeric = Number.isFinite(numericId) && numericId > 0;
      const isUUID = typeof id === "string" && id.length > 5;
      return isNumeric || isUUID;
    });
};

const extractSdgIds = (sdgData) => {
  if (!sdgData) return [];
  if (Array.isArray(sdgData)) {
    return sdgData
      .filter((s) => s && (s.documentId || s.id))
      .map((s) => normalizeId(s.documentId ?? s.id))
      .filter(Boolean);
  }
  // Handle single value case
  const singleId = normalizeId(sdgData.documentId ?? sdgData.id ?? sdgData);
  return singleId ? [singleId] : [];
};

export default function ProjectForm({ initialData, onSubmit, isEdit = false }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState(PROJECT_FORM_INITIAL);
  const [icTypesOptions, setIcTypesOptions] = useState([]);
  const [impactsOptions, setImpactsOptions] = useState([]);
  const [sdgsOptions, setSdgsOptions] = useState([]);
  const [departmentsOptions, setDepartmentsOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoize computed values
  const isEditing = useMemo(
    () => isEdit || Boolean(initialData?.documentId),
    [isEdit, initialData?.documentId]
  );

  // เก็บ attachments เดิมเพื่อเช็คความเปลี่ยนแปลงเวลา update
  const originalAttachmentIdsRef = useRef([]);

  // Memoize fund sub type options based on fund type
  const fundSubTypeOptions = useMemo(() => {
    switch (formData.fundType) {
      case "12":
        return subFundType1;
      case "11":
        return subFundType2;
      case "13":
        return subFundType3;
      case "10":
        return subFundType4;
      default:
        return [];
    }
  }, [formData.fundType]);

  const [createProject] = useMutation(CREATE_PROJECT, {
    context: {
      headers: {
        Authorization: session?.jwt ? `Bearer ${session?.jwt}` : "",
      },
    },
    onError: (error) => {
      console.error("Create project error:", error);
      toast.error(
        "เกิดข้อผิดพลาดในการสร้างโครงการ: " +
          (error?.message || "ไม่ทราบสาเหตุ")
      );
    },
  });

  const [updateProject] = useMutation(UPDATE_PROJECT, {
    context: {
      headers: {
        Authorization: session?.jwt ? `Bearer ${session?.jwt}` : "",
      },
    },
    onError: (error) => {
      console.error("Update project error:", error);
      toast.error(
        "เกิดข้อผิดพลาดในการอัปเดตโครงการ: " +
          (error?.message || "ไม่ทราบสาเหตุ")
      );
    },
  });

  // Memoize input change handler to prevent re-renders
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Check if fundName is "อื่นๆ" or custom value
  const isFundNameOther = useMemo(() => {
    if (!formData.fundName) return false;
    // Check if fundName is not in the predefined options
    const isInOptions = fundNameOptions.some(
      (opt) => opt.value === formData.fundName
    );
    return formData.fundName === "อื่นๆ" || !isInOptions;
  }, [formData.fundName]);

  // Get display value for fundName select
  const fundNameSelectValue = useMemo(() => {
    if (!formData.fundName) return "";
    const isInOptions = fundNameOptions.some(
      (opt) => opt.value === formData.fundName
    );
    return isInOptions ? formData.fundName : "อื่นๆ";
  }, [formData.fundName]);

  // Memoize submit handler to prevent re-creation
  const handleSubmit = useCallback(async () => {
    if (!session?.jwt) {
      toast.error("กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล");
      return;
    }

    // Basic validation
    // if (!formData.nameTH?.trim()) {
    //     toast.error('กรุณากรอกชื่อโครงการภาษาไทย');
    //     return;
    // }

    if (!formData.fiscalYear) {
      toast.error("กรุณากรอกปีงบประมาณ");
      return;
    }

    setIsSubmitting(true);

    try {
      const usersPermissionsUsers = Array.from(
        new Set(
          extractInternalUserIds(formData.partners)
            .map(normalizeId)
            .filter(Boolean)
        )
      );

      const attachmentIds = Array.from(
        new Set(extractAttachmentIds(formData.attachments))
      );

      // Use current attachments directly (FileUploadField manages state correctly)
      // Don't merge with original to avoid sending deleted file IDs
      const finalAttachmentIds = attachmentIds;


      const originalIdsSorted = [
        ...(originalAttachmentIdsRef.current || []),
      ].sort();
      const currentIdsSorted = [...finalAttachmentIds].sort();
      const attachmentsChanged =
        JSON.stringify(originalIdsSorted) !== JSON.stringify(currentIdsSorted);

      const toIdArray = (value) => {
        const normalized = normalizeId(value);
        return normalized ? [normalized] : [];
      };

      const toSdgIdArray = (value) => {
        if (!value) return [];
        if (Array.isArray(value)) {
          return value.map((v) => normalizeId(v)).filter(Boolean);
        }
        const normalized = normalizeId(value);
        return normalized ? [normalized] : [];
      };

      const projectData = {
        fiscalYear: parseIntegerOrNull(formData.fiscalYear),
        projectType: formData.projectType || null,
        projectMode: formData.projectMode || null,
        subProjectCount: formData.subProjectCount,
        nameTH: formData.nameTH?.trim() || null,
        nameEN: formData.nameEN?.trim() || null,
        isEnvironmentallySustainable:
          formData.isEnvironmentallySustainable || null,
        durationStart: formData.durationStart || null,
        durationEnd: formData.durationEnd || null,
        researchKind: formData.researchKind || null,
        fundType: formData.fundType || null,
        fundSubType: formData.fundSubType || null,
        fundName: formData.fundName || null,
        budget: parseIntegerOrNull(formData.budget),
        keywords: formData.keywords || null,
        departments: toIdArray(formData.departments),
        ic_types: toIdArray(formData.icTypes),
        impacts: toIdArray(formData.impact),
        sdgs: toSdgIdArray(formData.sdg),
        partners: Array.isArray(formData.partners)
          ? stripTypenameDeep(formData.partners)
          : [],
        attachments: finalAttachmentIds.length ? finalAttachmentIds : [],
        users_permissions_users: usersPermissionsUsers,
      };

      // Remove null/undefined values to avoid issues
      // Object.keys(projectData).forEach(key => {
      //     if (projectData[key] === undefined || projectData[key] === null || projectData[key] === "") {
      //         delete projectData[key];
      //     }
      // });

      // Sanitize projectData to avoid sending BigInt values (GraphQL cannot serialize BigInt)
      if (isEditing && !attachmentsChanged) {
        delete projectData.attachments;
      }

      const safeProjectData = stripTypenameDeep(projectData);

      if (onSubmit) {
        await onSubmit(safeProjectData);
        if (isEditing) {
          originalAttachmentIdsRef.current = finalAttachmentIds;
        }
      } else if (isEditing) {
        const targetId = normalizeId(initialData?.documentId);
        if (!targetId) {
          throw new Error("ไม่พบรหัสโครงการสำหรับการแก้ไข");
        }
        const updateResult = await updateProject({
          variables: {
            documentId: targetId,
            data: safeProjectData,
          },
        });
        if (!updateResult?.data?.updateProject?.documentId) {
          throw new Error("ไม่สามารถอัปเดตโครงการได้ กรุณาลองอีกครั้ง");
        }
        toast.success("อัปเดตโครงการสำเร็จแล้ว!");
        originalAttachmentIdsRef.current = finalAttachmentIds;
        // router.refresh();
        // router.push(`/form/project/view/${targetId}`);
        setTimeout(() => {
          window.location.href = `/form/project/view/${createdId}`;
        }, 1000);
      } else {
        const createResult = await createProject({
          variables: {
            data: safeProjectData,
          },
        });
        const createdId = normalizeId(
          createResult?.data?.createProject?.documentId
        );
        if (!createdId) {
          throw new Error("ไม่สามารถสร้างโครงการได้ กรุณาลองอีกครั้ง");
        }
        toast.success("บันทึกโครงการสำเร็จแล้ว!");
        // router.refresh();
        // router.push(`/form/project/view/${createdId}`);
        setTimeout(() => {
          window.location.href = `/form/project/view/${createdId}`;
        }, 1000);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        "เกิดข้อผิดพลาดในการบันทึก: " + (error?.message || "ไม่ทราบสาเหตุ")
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    session?.jwt,
    formData,
    isEditing,
    initialData?.documentId,
    onSubmit,
    updateProject,
    createProject,
  ]);

  // hydrate when editing - memoize to prevent unnecessary re-renders
  useEffect(() => {
    if (initialData) {
      // Clean initialData from BigInt values before processing
      const cleanedData = stripTypenameDeep(initialData);

      const normalizedIcType = normalizeId(
        cleanedData.ic_types?.[0]?.documentId ?? cleanedData.icTypes
      );
      const normalizedImpact = normalizeId(
        cleanedData.impacts?.[0]?.documentId ?? cleanedData.impact
      );
      // Handle SDG as array - extract all SDG IDs
      const normalizedSdgArray = extractSdgIds(
        cleanedData.sdgs ?? cleanedData.sdg
      );

      // Properly handle departments - check if it's an array and has items
      let normalizedDepartment = "";
      if (
        Array.isArray(cleanedData.departments) &&
        cleanedData.departments.length > 0
      ) {
        normalizedDepartment = normalizeId(
          cleanedData.departments[0]?.documentId
        );
      } else if (
        cleanedData.departments &&
        !Array.isArray(cleanedData.departments)
      ) {
        normalizedDepartment = normalizeId(
          cleanedData.departments.documentId ?? cleanedData.departments
        );
      }

      const hydrated = {
        ...PROJECT_FORM_INITIAL,
        ...cleanedData,
        // map relations to expected values
        icTypes: normalizedIcType ?? "",
        impact: normalizedImpact ?? "",
        sdg: normalizedSdgArray, // Now an array
        departments: normalizedDepartment ?? "",
      };
      setFormData(hydrated);
      originalAttachmentIdsRef.current = extractAttachmentIds(
        hydrated.attachments
      );
    }
  }, [initialData]); // Only depend on initialData, not its nested properties

  const {
    data: projectOptions,
    loading: projectOptionsLoading,
    error: projectOptionsError,
  } = useQuery(GET_PROJECT_OPTIONS, {
    skip: status !== "authenticated",
    context: {
      headers: {
        Authorization: session?.jwt ? `Bearer ${session?.jwt}` : "",
      },
    },
    onError: (error) => {
      console.error("Project options query error:", error);
      toast.error(
        "เกิดข้อผิดพลาดในการโหลดตัวเลือก: " +
          (error?.message || "ไม่ทราบสาเหตุ")
      );
    },
  });

  // Memoize options processing to prevent unnecessary recalculations
  const memoizedOptions = useMemo(() => {
    if (!projectOptions) {
      return {
        icTypes: [],
        impacts: [],
        sdgs: [],
        departments: [],
      };
    }

    return {
      icTypes: (projectOptions.icTypes ?? []).map((ic) => ({
        value: String(ic.documentId),
        label: ic.name,
      })),
      impacts: (projectOptions.impacts ?? []).map((imp) => ({
        value: String(imp.documentId),
        label: imp.name,
      })),
      sdgs: (projectOptions.sdgs ?? []).map((sdg) => ({
        value: String(sdg.documentId),
        label: sdg.name,
      })),
      departments: (projectOptions.departments ?? [])
        .filter((d) => d.title !== "สํานักงานเลขานุการ")
        .map((dep) => ({
          value: String(dep.documentId),
          label: dep.title,
        })),
    };
  }, [projectOptions]);

  // Update options state only when memoizedOptions change
  useEffect(() => {
    setIcTypesOptions(memoizedOptions.icTypes);
    setImpactsOptions(memoizedOptions.impacts);
    setSdgsOptions(memoizedOptions.sdgs);
    setDepartmentsOptions(memoizedOptions.departments);
  }, [memoizedOptions]);

  // Early return with loading state and error handling
  if (status === "loading" || projectOptionsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Loading form...</p>
      </div>
    );
  }

  if (projectOptionsError) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-red-600">
          Error loading form options. Please refresh the page.
        </p>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Initializing form...</p>
      </div>
    );
  }

  return (
    <>
      <Block>
        <div className="inputGroup">
          <FormInput
            id="fiscalYear"
            label="ปีงบประมาณ"
            value={formData.fiscalYear}
            placeholder="กรอกปีงบประมาณ"
            onChange={(e) => handleInputChange("fiscalYear", e.target.value)}
          />
          <FormRadio
            id="projectType"
            label="ประเภทโครงการ"
            value={formData.projectType}
            onChange={(e) => handleInputChange("projectType", e.target.value)}
            options={[
              { value: "0", label: "โครงการวิจัย" },
              { value: "1", label: "โครงการพัฒนาวิชาการประเภทงานวิจัย" },
            ]}
          />
          <FormRadio
            id="projectMode"
            label="ลักษณะโครงการวิจัย"
            value={formData.projectMode}
            onChange={(e) => handleInputChange("projectMode", e.target.value)}
            options={[
              { value: "0", label: "โครงการวิจัยเดี่ยว" },
              { value: "1", label: "แผนงานวิจัย หรือชุดโครงการวิจัย" },
            ]}
          />
          <FormInput
            id="subProjectCount"
            disabled={formData.projectMode == "0" || formData.projectMode == ""}
            type="number"
            label="จำนวนโครงการย่อย"
            value={formData.subProjectCount}
            placeholder="กรอกจำนวนโครงการย่อย"
            onChange={(e) =>
              handleInputChange("subProjectCount", e.target.value)
            }
          />
          {/* <FormInput id="project-name" label="ชื่อโครงการ" value="" placeholder="กรอกชื่อโครงการ" /> */}
          <FormTextarea
            id="nameTH"
            label="ชื่อแผนงานวิจัยหรือชุดโครงการวิจัย/โครงการวิจัย (ไทย)"
            value={formData.nameTH}
            onChange={(e) => handleInputChange("nameTH", e.target.value)}
            placeholder=""
            rows={5}
          />
          <FormTextarea
            id="nameEN"
            label="ชื่อแผนงานวิจัยหรือชุดโครงการวิจัย/โครงการวิจัย (อังกฤษ)"
            value={formData.nameEN}
            onChange={(e) => handleInputChange("nameEN", e.target.value)}
            placeholder=""
            rows={5}
          />
          <FormRadio
            id="isEnvironmentallySustainable"
            label=""
            value={formData.isEnvironmentallySustainable}
            onChange={(e) =>
              handleInputChange("isEnvironmentallySustainable", e.target.value)
            }
            options={[
              { value: "0", label: "เกี่ยวข้อง กับสิ่งแวดล้อมและความยั่งยืน" },
              {
                value: "1",
                label: "ไม่เกี่ยวข้อง กับสิ่งแวดล้อมและความยั่งยืน",
              },
            ]}
          />
          <FormDateSelect
            durationStart={formData.durationStart}
            durationEnd={formData.durationEnd}
            durationStartChange={(field, value) =>
              handleInputChange(field, value)
            }
            durationEndChange={(field, value) =>
              handleInputChange(field, value)
            }
            noDay={false}
          >
            ระยะเวลาการทำวิจัย{" "}
            <span className="text-blue-700">(ปี พ.ศ. 4 หลัก)</span>
            <span className="text-red-500 ml-1">*</span>
          </FormDateSelect>
          {/* <FormTextarea id="responsibleOrganization" label="หน่วยงานหลักที่รับผิดชอบโครงการวิจัย (หน่วยงานที่ขอทุน)" value={formData.responsibleOrganization} onChange={(e) => handleInputChange('responsibleOrganization', e.target.value)} placeholder="" rows={5} /> */}
          <FormSelect
            id="departments"
            label="หน่วยงานหลักที่รับผิดชอบโครงการวิจัย (หน่วยงานที่ขอทุน)"
            value={formData.departments ?? ""}
            placeholder="เลือกหน่วยงาน"
            onChange={(val) => handleInputChange("departments", val)}
            options={departmentsOptions}
          />
          <FormSelect
            id="researchKind"
            label="ประเภทงานวิจัย"
            value={formData.researchKind ?? ""}
            placeholder="เลือกประเภทงานวิจัย"
            onChange={(val) => handleInputChange("researchKind", val)}
            options={researchKindOptions}
          />
          <FormSelect
            id="fundType"
            label="ประเภทแหล่งทุน"
            disabled={formData.researchKind == ""}
            value={formData.fundType ?? ""}
            placeholder="เลือกประเภทแหล่งทุน"
            onChange={(val) => handleInputChange("fundType", val)}
            options={fundTypeOptions}
          />
          {fundSubTypeOptions.length > 0 && (
            <FormSelect
              id="fundSubType"
              label=" "
              value={formData.fundSubType ?? ""}
              placeholder="เลือกประเภทแหล่งทุน"
              onChange={(val) => handleInputChange("fundSubType", val)}
              options={fundSubTypeOptions}
            />
          )}
          <FormSelect
            id="fundName"
            label="ชื่อแหล่งทุน"
            disabled={formData.fundSubType == ""}
            value={fundNameSelectValue}
            placeholder="ชื่อแหล่งทุน"
            onChange={(val) => handleInputChange("fundName", val)}
            options={fundNameOptions}
          />
          {isFundNameOther && (
            <FormTextarea
              label="ระบุชื่อแหล่งทุน"
              value={formData.fundName === "อื่นๆ" ? "" : formData.fundName}
              onChange={(e) => handleInputChange("fundName", e.target.value)}
              placeholder="กรุณาระบุชื่อแหล่งทุน"
              rows={3}
            />
          )}
          <FormInput
            id="budget"
            type="number"
            label="งบวิจัย"
            value={formData.budget}
            placeholder="0"
            onChange={(e) => handleInputChange("budget", e.target.value)}
          />
          <FormTextarea
            id="keywords"
            label="คำสำคัญ (คั่นระหว่างคำด้วยเครื่องหมาย “;” เช่น ข้าว; พืช; อาหาร)"
            value={formData.keywords}
            onChange={(e) => handleInputChange("keywords", e.target.value)}
            placeholder=""
            rows={5}
          />
          <FormSelect
            id="icTypes"
            label="IC Types"
            value={formData.icTypes ?? ""}
            placeholder="เลือก IC Types"
            onChange={(val) => handleInputChange("icTypes", val)}
            options={icTypesOptions}
          />
          <FormSelect
            id="impact"
            label="Impact"
            value={formData.impact ?? ""}
            placeholder="เลือก Impact"
            onChange={(val) => handleInputChange("impact", val)}
            options={impactsOptions}
          />
          <FormMultiSelect
            id="sdgs"
            label="SDG"
            value={formData.sdg ?? []}
            placeholder="เลือก SDG"
            onChange={(val) => handleInputChange("sdg", val)}
            options={sdgsOptions}
          />
          <FileUploadField
            label="เอกสารแนบ"
            value={formData.attachments || []}
            onFilesChange={(files) => handleInputChange("attachments", files)}
          />
        </div>
      </Block>
      <Block className="mt-4">
        <Partners
          data={formData.partners}
          onChange={(partners) => handleInputChange("partners", partners)}
        />
      </Block>
      <div className="flex justify-end items-center gap-3 mt-4">
        <Button onClick={() => router.back()} variant="outline">
          ยกเลิก
        </Button>
        <Button
          variant="default"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </div>
    </>
  );
}
