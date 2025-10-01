
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function Block({ title, btnName, btnLink }) {
    return (
        <div className="my-4  flex items-center justify-between">
            <h2 className={`text-2xl font-semibold text-gray-900 dark:text-white`}>
                {title}
            </h2>
            {btnName && btnLink && (
                <div className="mt-2">
                    <Link href={btnLink}>
                        <Button>{btnName}</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
