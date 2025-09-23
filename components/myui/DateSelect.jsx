"use client"

import { useEffect, useMemo, useState, useCallback } from "react"

/** รายชื่อเดือนภาษาไทยแบบคงที่ */
const monthThai = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
]

/** แปลงชื่อเดือน -> หมายเลขเดือน (1-12) */
const monthMap = Object.fromEntries(monthThai.map((m, i) => [m, i + 1]))

/** ตรวจปีอธิกสุรทินแบบคริสต์ศักราช */
const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0

export default function DateSelect({ title, value, onChange, noDay = false }) {
    /** 
     * แปลงค่า value (YYYY-MM-DD, ค.ศ.) -> state เริ่มต้นของ day, month, yearTh
     * ใช้ useMemo เพื่อคำนวณครั้งเดียวต่อ value ที่เปลี่ยน
     */
    const initialParts = useMemo(() => {
        if (!value) return null
        const [y, m, d] = value.split("-").map((v) => parseInt(v, 10))
        if (!y || !m || (!noDay && !d)) return null
        return {
            day: noDay ? 1 : d,
            month: monthThai[m - 1] ?? monthThai[0],
            yearTh: y + 543,
        }
    }, [value, noDay])

    /** state เลือกวัน เดือน ปี (พ.ศ.) */
    const [day, setDay] = useState(() => initialParts?.day ?? 1)
    const [month, setMonth] = useState(() => initialParts?.month ?? monthThai[0])
    const [yearTh, setYearTh] = useState(() => initialParts?.yearTh ?? 2568)

    /** sync state เมื่อ value ภายนอกเปลี่ยน */
    useEffect(() => {
        if (!initialParts) return
        setDay(initialParts.day)
        setMonth(initialParts.month)
        setYearTh(initialParts.yearTh)
    }, [initialParts])

    /** ตัวเลือกปี (พ.ศ.) ใช้ useMemo ให้สร้างครั้งเดียว */
    const yearOptions = useMemo(() => {
        // เริ่มจาก พ.ศ.2560 จำนวน 30 ปี (ปรับตามต้องการ)
        return Array.from({ length: 30 }, (_, i) => 2560 + i)
    }, [])

    /** ปี ค.ศ. ที่ได้จากปี พ.ศ. */
    const gYear = useMemo(() => {
        const y = parseInt(yearTh, 10)
        // ป้องกันค่าเพี้ยน และกำหนดกรอบล่าง
        return Math.max(1900, (isNaN(y) ? 2568 : y) - 543)
    }, [yearTh])

    /** จำนวนวันสูงสุดของเดือนที่เลือก คำนวณใหม่เมื่อเดือนหรือปีเปลี่ยน */
    const maxDays = useMemo(() => {
        const m = monthMap[month] || 1
        if ([1, 3, 5, 7, 8, 10, 12].includes(m)) return 31
        if ([4, 6, 9, 11].includes(m)) return 30
        // กุมภาพันธ์
        return isLeap(gYear) ? 29 : 28
    }, [month, gYear])

    /** ตัวเลือกวันตามจำนวนวันจริงของเดือนนั้น */
    const dayOptions = useMemo(
        () => Array.from({ length: maxDays }, (_, i) => i + 1),
        [maxDays]
    )

    /** บีบค่า day ไม่ให้เกิน maxDays เมื่อเดือน/ปีเปลี่ยน */
    useEffect(() => {
        if (noDay) return
        if (day > maxDays) setDay(maxDays)
    }, [maxDays, day, noDay])

    /** ค่าที่จะส่งออกในรูปแบบ YYYY-MM-DD (ค.ศ.) */
    const outValue = useMemo(() => {
        const mNum = monthMap[month] || 1
        const mm = String(mNum).padStart(2, "0")
        const dd = String(noDay ? 1 : day).padStart(2, "0")
        return `${gYear}-${mm}-${dd}`
    }, [gYear, month, day, noDay])

    /** เรียก onChange เฉพาะเมื่อค่าที่คำนวณต่างจาก value ภายนอก เพื่อลด re-render chain */
    useEffect(() => {
        if (!onChange) return
        if (value !== outValue) onChange(outValue)
    }, [outValue, onChange, value])

    /** handlers ใช้ useCallback ลดการสร้างฟังก์ชันใหม่ในทุก render */
    const handleDayChange = useCallback((e) => {
        setDay(parseInt(e.target.value, 10) || 1)
    }, [])

    const handleMonthChange = useCallback((e) => {
        setMonth(e.target.value)
    }, [])

    const handleYearChange = useCallback((e) => {
        setYearTh(parseInt(e.target.value, 10) || 2568)
    }, [])

    return (
        <div className="flex items-center gap-x-4">
            <p className="text-zinc-700 font-medium">{title}</p>

            {!noDay && (
                <div className="space-x-2">
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
            )}

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
}
