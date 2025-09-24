"use client"
import { useCallback, useId, useMemo } from "react"
import {
    Select, SelectContent, SelectGroup, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * FormSelect
 * - คุมค่าแบบ controlled อย่างถูกต้อง
 * - กันค่า "" และกัน setState ซ้ำ
 * - บังคับให้ option.value เป็นสตริงเสมอ
 * - ผูก label กับ trigger ด้วย id ที่เสถียร
 */
export default function FormInputSelect({
    id,
    label,
    after,
    valueInput,
    onInputChange,
    value,
    onChange,
    options = [],
    placeholder = "Select an option",
    ...props
}) {
    const autoId = useId()
    const fieldId = id ?? autoId

    // ทำให้ค่าของ options เป็นสตริงเสมอ เพื่อลดเคส mismatch
    const normalizedOptions = useMemo(
        () => options.map(o => ({ value: String(o.value), label: o.label })),
        [options]
    )

    // ค่าที่ส่งให้ <Select> ต้องเป็นสตริงหรือ undefined เท่านั้น
    const selectValue = useMemo(() => {
        if (value === null || value === "") return undefined
        return String(value)
    }, [value])

    const handleValueChange = useCallback((next) => {
        if (next === "") return                // ห้ามใช้ "" ใน SelectItem และกันการ clear
        if (String(value) === next) return     // กัน setState ซ้ำ
        onChange?.(next)                       // ส่งสตริงกลับ ไม่ใช่ event
    }, [onChange, value])

    return (
        <div className="space-y-1 flex items-center forminput">
            {label && (
                <div className="w-1/3">
                    <Label htmlFor={fieldId}>{label}</Label>
                </div>
            )}

            <div className="flex-1 space-x-3 flex gap-4 items-center">
                <div>
                    <Input value={valueInput} onChange={(e) => onInputChange?.(e.target.value)} />
                </div>
                <div>
                    {after}
                </div>
                <Select
                    value={selectValue}
                    onValueChange={handleValueChange}
                    {...props}
                >
                    <SelectTrigger id={fieldId} className="w-full">
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectGroup>
                            {normalizedOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
