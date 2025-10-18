"use client"
import { useCallback, useId, useMemo } from "react"
import { X } from "lucide-react"
import {
    Select, SelectContent, SelectGroup, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

/**
 * FormMultiSelect
 * - รองรับการเลือกหลายรายการ (multiple selection)
 * - คุมค่าแบบ controlled อย่างถูกต้อง
 * - รับค่า value เป็น array หรือ string ที่คั่นด้วย comma
 * - ส่งค่ากลับเป็น array เสมอ
 */
export default function FormMultiSelect({
    id,
    label,
    value,
    onChange,
    options = [],
    placeholder = "Select options",
    disabled = false,
    ...props
}) {
    const autoId = useId()
    const fieldId = id ?? autoId

    // ทำให้ค่าของ options เป็นสตริงเสมอ เพื่อลดเคส mismatch
    const normalizedOptions = useMemo(
        () => options.map(o => ({ value: String(o.value), label: o.label })),
        [options]
    )

    // แปลง value เป็น array เสมอ
    const selectedValues = useMemo(() => {
        if (!value) return []
        if (Array.isArray(value)) {
            return value.map(v => String(v)).filter(v => v !== "")
        }
        if (typeof value === 'string') {
            return value.split(',').map(v => v.trim()).filter(v => v !== "")
        }
        return [String(value)].filter(v => v !== "")
    }, [value])

    // หาชื่อของ options ที่เลือกแล้ว
    const selectedLabels = useMemo(() => {
        return selectedValues.map(val => {
            const option = normalizedOptions.find(opt => opt.value === val)
            return option ? option.label : val
        })
    }, [selectedValues, normalizedOptions])

    const handleValueChange = useCallback((next) => {
        if (!next || next === "") return
        
        const newSelectedValues = [...selectedValues]
        const index = newSelectedValues.indexOf(next)
        
        if (index > -1) {
            // ถ้าเลือกแล้ว ให้ยกเลิกการเลือก
            newSelectedValues.splice(index, 1)
        } else {
            // ถ้ายังไม่เลือก ให้เพิ่มเข้าไป
            newSelectedValues.push(next)
        }
        
        onChange?.(newSelectedValues)
    }, [onChange, selectedValues])

    const handleRemoveValue = useCallback((valueToRemove) => {
        const newSelectedValues = selectedValues.filter(val => val !== valueToRemove)
        onChange?.(newSelectedValues)
    }, [onChange, selectedValues])

    const displayValue = selectedLabels.length > 0 
        ? `Selected ${selectedLabels.length} item${selectedLabels.length > 1 ? 's' : ''}`
        : placeholder

    return (
        <div className="space-y-2 sm:space-y-1 flex flex-col sm:flex-row sm:items-center forminput">
            {label && (
                <div className="sm:w-1/3">
                    <Label htmlFor={fieldId}>{label}</Label>
                </div>
            )}

            <div className="flex-1 space-x-3 flex gap-4 items-center">
                <div className="w-full space-y-2">
                    <Select
                        value=""
                        onValueChange={handleValueChange}
                        disabled={disabled}
                        {...props}
                    >
                        <SelectTrigger id={fieldId} className="w-full">
                            <SelectValue placeholder={displayValue} />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectGroup>
                                {normalizedOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        <div className="flex items-center justify-between w-full">
                                            <span>{opt.label}</span>
                                            {selectedValues.includes(opt.value) && (
                                                <span className="ml-2 text-green-600">✓</span>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    
                    {/* แสดง badges ของรายการที่เลือก */}
                    {selectedLabels.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedLabels.map((label, index) => (
                                <Badge 
                                    key={selectedValues[index]} 
                                    variant="secondary" 
                                    className="flex items-center gap-1"
                                >
                                    {label}
                                    <X 
                                        className="h-3 w-3 cursor-pointer hover:text-red-500" 
                                        onClick={() => handleRemoveValue(selectedValues[index])}
                                    />
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
