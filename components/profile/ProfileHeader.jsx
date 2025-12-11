import Block from "@/components/layout/Block";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
export default function ProfileHeader({ data , other = false }) {
    function initials(name, fallback) {
        const s = (name || '').trim()
        if (!s) return (fallback || 'U').slice(0, 2).toUpperCase()
        const parts = s.split(/[\n+\s]+/)
        return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '') || s[0]).toUpperCase()
    }
    const strapiUrl = process.env.PUBLIC_BASE_URL == 'https://fahsai.bus.ku.ac.th' ? 'https://fahsai.bus.ku.ac.th/strapi/' : process.env.NEXT_PUBLIC_API_BASE_URL;
    return (
        <Block>
            <div className="flex flex-col lg:flex-row items-start space-y-4 lg:space-y-0 lg:space-x-6">
                <div className="flex-shrink-0">
                    {data.avatar ? (
                        <div className="w-32 h-32 rounded-full overflow-hidden">
                            <img src={`${strapiUrl}${data.avatar.url}`} alt={data.firstNameTH || 'avatar'} width={96} height={96} className="object-cover w-32 h-32 rounded-full" />
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                            <div className="w-full h-full bg-primary text-white text-2xl font-bold flex items-center justify-center rounded-full">
                                {initials(data.firstNameTH, data.email)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        {data.firstNameTH ? `${data.firstNameTH} ${data.lastNameTH}` : 'No Name'}
                    </h1>
                    <p className="text-lg text-gray-600 mb-2">{[data.faculties.map(faculty => faculty.title), data.departments.map(department => department.title)].filter(Boolean).join(' • ')}</p>
                    <div className="text-sm text-gray-500 space-y-1">
                        <p>{data.email}</p>
                        {/* {data.academicPosition ? <p>Job Type: {data.academicPosition}</p> : null} */}
                        {data.highDegree ? <p>Highest Degree: {data.highDegree}</p> : null}
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0">
                    <Link href={other ? `/admin/user/${data.documentId || data.id}/edit` : '/profile/edit'}>
                        <Button variant="outline">Edit profile</Button>
                    </Link>
                </div>
            </div>
        </Block>
    );
}