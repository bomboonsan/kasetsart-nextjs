import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function FormRadio({ id, onChange, options, label, disabled = false, ...props }) {
    return (
        <div className="space-y-2 sm:space-y-1 flex flex-col sm:flex-row sm:items-center forminput">
            {label && <div className="sm:w-1/3">
                <Label htmlFor={id}>{label}</Label>
            </div>}
            <div className="flex-1 space-x-3 flex gap-4 items-center flex-wrap">
                {options.map((option) => (
                    <div key={option.value} className="flex items-center">
                        <Input
                            id={`${id}-${option.value}`}
                            type="radio"
                            className={"w-4 h-4"}
                            value={option.value}
                            checked={option.value === props.value}
                            onChange={onChange}
                            disabled={disabled}
                        />
                        <Label htmlFor={`${id}-${option.value}`} className="ml-2 font-normal">
                            {option.label}
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    );
}
