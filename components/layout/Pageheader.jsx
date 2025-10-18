
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function Block({ title, btnName, btnLink }) {
    return (
        <div className="my-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className={`text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white`}>
                {title}
            </h2>
            {btnName && btnLink && (
                <div>
                    <Link href={btnLink}>
                        <Button className="w-full sm:w-auto">{btnName}</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
