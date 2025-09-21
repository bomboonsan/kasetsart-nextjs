import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function FieldSelect({ id, label, value, onChange, options, placeholder, ...props }) {
    return (
        <div className="space-y-1">
            <Label htmlFor={id}>{label}</Label>
            <Select value={value} onValueChange={onChange} {...props}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={placeholder || "Select an option"} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {options && options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}