interface LoaderProps {
    className?: string;
    size?: number;
    fullHeight?: boolean;
    message?: string;
}

export const Loader = ({
    className = '',
    size = 40,
    fullHeight = false,
    message
}: LoaderProps) => {

    const wrapperClasses = fullHeight
        ? "min-h-[60vh] flex flex-col items-center justify-center gap-4 w-full"
        : `flex flex-col justify-center items-center gap-4 ${className}`;

    return (
        <div className={wrapperClasses}>
            <div
                className="rounded-full animate-spin border-4 border-emerald-200 border-t-emerald-600"
                style={{ width: size, height: size }}
            ></div>
            {message && <p className="text-slate-500 font-medium animate-pulse">{message}</p>}
        </div>
    );
};
