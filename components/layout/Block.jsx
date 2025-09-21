
export default function Block({ className, children }) {
    return (
        <div className={`p-4 bg-white rounded-lg shadow-md ${className}`}>
            {children}
        </div>
    );
}
