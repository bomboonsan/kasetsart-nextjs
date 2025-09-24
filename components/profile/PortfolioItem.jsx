import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PublicationItem({ title, description, editLink, attachments }) {
    console.log("PublicationItem attachments:", attachments);
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
                    {editLink && <Link href={editLink} passHref>
                        <Button variant="outline" className="text-sm px-3 py-1.5">
                            แก้ไขผลงาน
                        </Button>
                    </Link>}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="default" className="text-sm px-3 py-1.5">ดูเอกสาร</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                            <DialogHeader>
                                <DialogTitle>ไฟล์แนบ</DialogTitle>
                                <DialogDescription>รายการไฟล์ที่แนบมากับผลงานนี้</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2 mt-4">
                                {attachments && attachments.length > 0 ? (
                                    attachments.map((file) => (
                                        <div key={file.documentId || file.id} className="flex items-center justify-between">
                                            <a className="text-blue-600 hover:underline" href={`${process.env.NEXT_PUBLIC_API_BASE_URL}${file.url}`} target="_blank" rel="noreferrer">
                                                {file.name}
                                            </a>
                                            <div className="text-xs text-gray-500">{file.size ? `${(file.size / 1024).toFixed(2)} KB` : ''}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-600">ไม่มีไฟล์แนบ</div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}
