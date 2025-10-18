import { Label } from "@/components/ui/label"
export default function FieldView({ label, value }) {
    return (
        <div className="space-y-2 sm:space-y-1 flex flex-col sm:flex-row sm:items-center forminput">
            <div className="sm:w-1/3">
                <Label>{label}</Label>
            </div>
            <div className="flex-1">{value || '-'}</div>
        </div>
    );
}