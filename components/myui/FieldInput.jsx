import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function FieldInput({ id, label, ...props }) {
    return (
        <div className="space-y-1">
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} {...props} />
        </div>
    );
}
