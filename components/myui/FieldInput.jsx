import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useId } from 'react';

export default function FieldInput({ id = useId(), label, ...props }) {
    return (
        <div className="space-y-1">
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} {...props} />
        </div>
    );
}
