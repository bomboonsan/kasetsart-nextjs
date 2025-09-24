
export default function Block({ className, children }) {
    return (
        <div className={`p-4 md:p-6 bg-white rounded-lg shadow-md relative z-0 ${className}`}>
            {children}
        </div>
    );
}
