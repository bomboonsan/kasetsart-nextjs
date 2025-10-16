"use client"

import { useEffect, useMemo, useState, useCallback, useRef } from "react"

/** รายชื่อเดือนภาษาไทยแบบคงที่ */
const monthThai = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
]

/** แปลงชื่อเดือน -> หมายเลขเดือน (1-12) */
const monthMap = Object.fromEntries(monthThai.map((m, i) => [m, i + 1]))

/** ตรวจปีอธิกสุรทินแบบคริสต์ศักราช */
const isLeap = (y) => {
    try {
        const year = Number(y)
        if (!Number.isInteger(year) || year < 1) return false
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
    } catch {
        return false
    }
}

export default function DateSelect({ title = '', value, onChange, noDay = false }) {
    // ใช้ ref เพื่อป้องกัน infinite loop ใน onChange effect
    const isInternalChangeRef = useRef(false)
    const prevValueRef = useRef(value)
    const isSyncingFromValueRef = useRef(false)
    const hasUserInteractionRef = useRef(false)

    /** 
     * แปลงค่า value (YYYY-MM-DD หรือ YYYY-MM, ค.ศ.) -> state เริ่มต้นของ day, month, yearTh
     * ใช้ useMemo เพื่อคำนวณครั้งเดียวต่อ value ที่เปลี่ยน
     * เพิ่ม error handling เพื่อป้องกัน client-side exception
     * ถ้า noDay=true จะละเลยวันที่จาก value และใช้วันที่ 1 เสมอ
     */
    const initialParts = useMemo(() => {
        try {
            if (!value || typeof value !== 'string') {
                return null
            }

            const parts = value.split("-")
            // รองรับทั้ง YYYY-MM-DD (3 parts) และ YYYY-MM (2 parts)
            if (parts.length !== 3 && parts.length !== 2) {
                return null
            }

            const [y, m, d] = parts.map((v) => {
                const num = parseInt(v, 10)
                return Number.isInteger(num) ? num : null
            })

            // ถ้า noDay=true ให้ใช้วันที่ 1 เสมอ โดยไม่สนใจค่าวันที่ใน value
            // ถ้าไม่มี day ใน value ก็ให้ใช้วันที่ 1
            const dayValue = noDay ? 1 : (d || 1)

            if (!y || !m) {
                return null
            }
            if (m < 1 || m > 12) {
                return null
            }
            // เมื่อ noDay=true ไม่ต้องตรวจสอบความถูกต้องของวันที่
            if (!noDay && d && (d < 1 || d > 31)) {
                return null
            }

            return {
                day: dayValue,
                month: monthThai[m - 1] ?? monthThai[0],
                yearTh: y + 543,
            }
        } catch (error) {
            console.error('DateSelect parsing error:', error)
            return null
        }
    }, [value, noDay])

    /** 
     * state เลือกวัน เดือน ปี (พ.ศ.)
     * ใช้ initialParts เป็น default แต่ให้ controlled จาก parent
     */
    const [day, setDay] = useState(() => initialParts?.day ?? 1)
    const [month, setMonth] = useState(() => initialParts?.month ?? monthThai[0])
    const [yearTh, setYearTh] = useState(() => initialParts?.yearTh ?? 2568)

    /** 
     * sync state เมื่อ value ภายนอกเปลี่ยน
     * ปรับปรุงให้ sync ได้ทั้งกรณี mount ครั้งแรกและเมื่อ value เปลี่ยนทีหลัง
     */
    useEffect(() => {
        const hasExternalValue = typeof value === 'string' && value.trim() !== ''
        const valueChanged = prevValueRef.current !== value

        if (!valueChanged) {
            if (!hasExternalValue) {
                hasUserInteractionRef.current = false
            }
            return
        }

        if (isInternalChangeRef.current) {
            isInternalChangeRef.current = false
            prevValueRef.current = value
            return
        }

        if (!hasExternalValue) {
            hasUserInteractionRef.current = false
        }

        if (initialParts) {
            isSyncingFromValueRef.current = true
            setDay(initialParts.day)
            setMonth(initialParts.month)
            setYearTh(initialParts.yearTh)
        }

        prevValueRef.current = value
    }, [value, initialParts])

    /** ตัวเลือกปี (พ.ศ.) ใช้ useMemo ให้สร้างครั้งเดียว */
    const yearOptions = useMemo(() => {
        // เริ่มจาก พ.ศ.2560 จำนวน 30 ปี (ปรับตามต้องการ)
        return Array.from({ length: 30 }, (_, i) => 2560 + i)
    }, [])

    /** ปี ค.ศ. ที่ได้จากปี พ.ศ. - เพิ่ม error handling */
    const gYear = useMemo(() => {
        try {
            const y = Number(yearTh)
            // ป้องกันค่าเพี้ยน และกำหนดกรอบล่าง
            if (!Number.isInteger(y) || y < 2460) return 2025 // ค.ศ. 1917 -> 2025
            return Math.max(1900, y - 543)
        } catch {
            return 2025 // fallback year
        }
    }, [yearTh])

    /** จำนวนวันสูงสุดของเดือนที่เลือก คำนวณใหม่เมื่อเดือนหรือปีเปลี่ยน - เพิ่ม error handling */
    const maxDays = useMemo(() => {
        try {
            const m = monthMap[month]
            if (!m || m < 1 || m > 12) return 31 // fallback

            if ([1, 3, 5, 7, 8, 10, 12].includes(m)) return 31
            if ([4, 6, 9, 11].includes(m)) return 30
            // กุมภาพันธ์
            return isLeap(gYear) ? 29 : 28
        } catch {
            return 31 // fallback
        }
    }, [month, gYear])

    /** ตัวเลือกวันตามจำนวนวันจริงของเดือนนั้น */
    const dayOptions = useMemo(
        () => Array.from({ length: maxDays }, (_, i) => i + 1),
        [maxDays]
    )

    /** บีบค่า day ไม่ให้เกิน maxDays เมื่อเดือน/ปีเปลี่ยน - ป้องกัน unnecessary updates */
    useEffect(() => {
        if (noDay) return
        if (day > maxDays && day !== maxDays) {
            setDay(maxDays)
        }
    }, [maxDays, day, noDay])

    /** ค่าที่จะส่งออกในรูปแบบ YYYY-MM-DD (ค.ศ.) - ถ้า noDay=true จะตั้งวันเป็น 01 เสมอ */
    const outValue = useMemo(() => {
        try {
            const mNum = monthMap[month]
            if (!mNum || mNum < 1 || mNum > 12) {
                return `${gYear}-01-01` // fallback
            }

            const mm = String(mNum).padStart(2, "0")

            // ถ้า noDay=true ให้ส่ง YYYY-MM-01 (วันที่ 1 เสมอ)
            if (noDay) {
                return `${gYear}-${mm}-01`
            }

            // ถ้ามีวัน ให้ส่ง YYYY-MM-DD ตามปกติ
            const dayValue = Math.max(1, Math.min(day, 31))
            const dd = String(dayValue).padStart(2, "0")
            return `${gYear}-${mm}-${dd}`
        } catch {
            return `${gYear}-01-01` // fallback
        }
    }, [gYear, month, day, noDay])

    /** เรียก onChange เฉพาะเมื่อค่าที่คำนวณต่างจาก value ภายนอก เพื่อลด re-render chain */
    useEffect(() => {
        if (!onChange || typeof onChange !== 'function') return

        if (isSyncingFromValueRef.current) {
            isSyncingFromValueRef.current = false
            return
        }

        const hasExternalValue = typeof value === 'string' && value.trim() !== ''
        if (!hasExternalValue && !hasUserInteractionRef.current) {
            return
        }

        if (value === outValue) return

        // ป้องกัน infinite loop โดยการทำ flag
        isInternalChangeRef.current = true

        try {
            onChange(outValue)
        } catch (error) {
            console.warn('DateSelect onChange error:', error)
            isInternalChangeRef.current = false
        }
    }, [outValue, onChange, value])

    /** handlers ใช้ useCallback ลดการสร้างฟังก์ชันใหม่ในทุก render - เพิ่ม error handling */
    const handleDayChange = useCallback((e) => {
        try {
            const newDay = parseInt(e.target.value, 10)
            if (Number.isInteger(newDay) && newDay >= 1 && newDay <= 31) {
                hasUserInteractionRef.current = true
                setDay(newDay)
            }
        } catch {
            // ignore invalid values
        }
    }, [])

    const handleMonthChange = useCallback((e) => {
        try {
            const newMonth = e.target.value
            if (typeof newMonth === 'string' && monthThai.includes(newMonth)) {
                hasUserInteractionRef.current = true
                setMonth(newMonth)
            }
        } catch {
            // ignore invalid values
        }
    }, [])

    const handleYearChange = useCallback((e) => {
        try {
            const newYear = parseInt(e.target.value, 10)
            if (Number.isInteger(newYear) && newYear >= 2460 && newYear <= 3000) {
                hasUserInteractionRef.current = true
                setYearTh(newYear)
            }
        } catch {
            // ignore invalid values
        }
    }, [])

    // เพิ่ม error boundary สำหรับ render
    try {
        return (
            <div className="flex items-center gap-x-4">
                <p className="text-zinc-700 font-medium">{title}</p>

                <div className={noDay ? "hidden" : "space-x-2"}>
                    <label className="text-zinc-700">วันที่</label>
                    <select
                        className="text-zinc-800 border border-gray-300 rounded-md px-3 py-2"
                        value={day}
                        onChange={handleDayChange}
                    >
                        {dayOptions.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                <div className="space-x-2">
                    <label className="text-zinc-700">เดือน</label>
                    <select
                        className="text-zinc-800 border border-gray-300 rounded-md px-3 py-2"
                        value={month}
                        onChange={handleMonthChange}
                    >
                        {monthThai.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>

                <div className="space-x-2">
                    <label className="text-zinc-700">ปี</label>
                    <select
                        className="text-zinc-800 border border-gray-300 rounded-md px-3 py-2"
                        value={yearTh}
                        onChange={handleYearChange}
                    >
                        {yearOptions.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>
        )
    } catch (error) {
        console.error('DateSelect render error:', error)
        return (
            <div className="flex items-center gap-x-4">
                <p className="text-red-500">Error loading date selector</p>
            </div>
        )
    }
}
