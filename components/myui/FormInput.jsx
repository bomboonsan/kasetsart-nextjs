import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function FormInput({ id , value, onChange, type = "text", label, ...props }) {
    return (
        <div className="space-y-2 sm:space-y-1 flex flex-col sm:flex-row sm:items-center forminput">
            <div className="sm:w-1/3">
                <Label htmlFor={id}>{label}</Label>
            </div>
            <div className="flex-1 space-x-3">
                <Input id={id} type={type} value={value} {...props} onChange={onChange} />
            </div>
        </div>
    );
}
