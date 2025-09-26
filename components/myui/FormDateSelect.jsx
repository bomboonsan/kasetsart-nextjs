import DateSelect from './DateSelect';
export default function FormDateSelect({ id , label, durationStart, durationEnd, durationStartChange, durationEndChange, noDay = false, ...props }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <p className="text-zinc-700">

                    {props.children}
                </p>
            </div>
            <div>
                <DateSelect
                    noDay={noDay}
                    title="เริ่มต้น"
                    value={durationStart}
                    onChange={(value) =>
                        durationStartChange("durationStart", value)
                    }
                />
            </div>
            <div>
                <DateSelect
                    noDay={noDay}
                    title="สิ้นสุด"
                    value={durationEnd}
                    onChange={(value) => durationEndChange("durationEnd", value)}
                />
            </div>
        </div>
    );
}