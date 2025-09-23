import { Label } from "@/components/ui/label"
export default function FieldView({ label, value }) {
    return (
        <div className="space-y-1 flex items-center forminput">
            <div className="w-1/3">
                <Label>{label}</Label>
            </div>
            <div className="flex-1">{value || '-'}</div>
        </div>
    );
}