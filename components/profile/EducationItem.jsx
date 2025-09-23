export default function EducationItem({ level, institution, field, year }) {
    return (
        <div className="border-l-4 border-gray-200 pl-4">
            <h3 className="font-semibold text-gray-900 mb-1">{level}</h3>
            <p className="text-gray-600 mb-1">{institution}</p>
            <p className="text-gray-600 mb-1">{field}</p>
            <p className="text-sm text-gray-500">{year}</p>
        </div>
    )
}
