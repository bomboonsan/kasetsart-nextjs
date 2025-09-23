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

export default function FormSelect({ id, label, value, onChange, options, placeholder, ...props }) {
    const handleValueChange = (newValue) => {
        if (newValue === '') {
            return;
        }
        console.log('Selected value:', newValue);
        onChange(newValue);
    };

    return (
        <div className="space-y-1 flex items-center forminput">
            {label && <div className="w-1/3">
                <Label htmlFor={id}>{label}</Label>
            </div>}
            <div className="flex-1 space-x-3 flex gap-4 items-center">
                <Select value={value}
                    onValueChange={handleValueChange} {...props}
                >
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
        </div>
    );
}