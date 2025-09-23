import EducationItem from "@/components/profile/EducationItem";
import Block from "@/components/layout/Block";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
export default function ProfileEducation({ data }) {
    console.log("ProfileEducation data:", data);
    return (
        <Block className="mt-6">
            <div className="space-y-6">
                {data.length === 0 ? (
                    <div className="text-sm text-gray-500">ยังไม่มีข้อมูลการศึกษา</div>
                ) : (data.map((item, index) => (
                    <EducationItem
                        key={item.documentId || `edu-${index}`}
                        level={item.level} // ระดับวุฒิ
                        institution={item.institution} // สถาบัน
                        field={item.field} // สาขา
                        year={item.year} // ปีที่จบ
                    />
                ))
                )}
            </div>
        </Block>
    );
}