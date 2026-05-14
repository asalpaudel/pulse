const VARIANTS = {
  primary:
    "bg-pulse text-white hover:bg-pulse-dark focus-visible:ring-pulse/40 shadow-sm",
  secondary:
    "bg-white text-pulse border border-pulse/30 hover:bg-pulse/5 focus-visible:ring-pulse/30",
  ghost:
    "bg-transparent text-stone-600 hover:bg-stone-100 focus-visible:ring-stone-300",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400 shadow-sm",
  outline:
    "bg-transparent text-stone-700 border border-stone-300 hover:bg-stone-50 focus-visible:ring-stone-300",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className = "",
  loading = false,
  disabled = false,
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
