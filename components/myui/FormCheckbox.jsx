import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function FormCheckbox({ id , onChange, options, label, ...props }) {
    return (
        <div className="space-y-1 flex items-center forminput">
            {label && <div className="w-1/3">
                <Label htmlFor={id}>{label}</Label>
            </div>}
            <div className="flex-1 space-x-3 flex gap-4 items-center">
                {options.map((option) => (
                    <div key={option.value} className="flex items-center">
                        <Checkbox
                            id={`${id}-${option.value}`}
                            className={"w-4 h-4"}
                            value={option.value}
                            checked={props.value.includes(option.value)}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    onChange({
                                        target: {
                                            value: [...props.value, option.value],
                                        },
                                    });
                                } else {
                                    onChange({
                                        target: {
                                            value: props.value.filter((v) => v !== option.value),
                                        },
                                    });
                                }
                            }}
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
