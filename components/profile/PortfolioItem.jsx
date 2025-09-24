import { Button }  from "@/components/ui/button";

export default function PublicationItem({ title, description }) {
    return (
        <div className="border-b border-b-gray-200 py-3 last:border-b-0">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3">
                        {description}
                    </p>
                </div>
                <div className="flex-shrink-0 flex gap-2">
                    <Button variant="outline" className="text-sm px-3 py-1.5">
                        แก้ไขผลงาน
                    </Button>
                    <Button variant="default" className="text-sm px-3 py-1.5">
                        ดูเอกสาร
                    </Button>
                </div>
            </div>
        </div>
    )
}
