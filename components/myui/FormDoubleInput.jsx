import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function FormDoubleInput({ id = Math.floor(Math.random() * 10000), before , after , value1 , value2, onChange1 , onChange2, type = "text", label, ...props }) {
    return (
        <div className="space-y-1 flex items-center forminput">
            <div className="w-1/3">
                <Label htmlFor={id}>{label}</Label>
            </div>
            <div className="flex-1 space-x-3 flex items-center gap-2">
                <div className="flex-auto">
                    {before}
                </div>
                <Input id={id} type={type} value={value1} {...props} onChange={onChange1} />
                <div className="flex-auto w-fit">
                    {after}
                </div>
                <Input id={id} type={type} value={value2} {...props} onChange={onChange2} />
            </div>
        </div>
    );
}
