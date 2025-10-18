import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function FormTextarea({ id, value, label, ...props }) {
    return (
        <div className="space-y-2 sm:space-y-1 flex flex-col sm:flex-row sm:items-start forminput">
            <div className="sm:w-1/3">
                <Label htmlFor={id}>{label}</Label>
            </div>
            <div className="flex-1 space-x-3">
                <Textarea id={id} value={value} {...props} />
            </div>
        </div>
    );
}
