const VARIANTS = {
  // Primary — red fill, the hero CTA.
  primary:
    "bg-primary text-white hover:bg-primary-600 focus-visible:ring-primary/40 shadow-sm",
  // Secondary — light pink fill, low-emphasis next to a primary.
  secondary:
    "bg-blush-card text-primary border border-primary/20 hover:bg-blush-soft focus-visible:ring-primary/30",
  // Inverted — deep navy fill for structural emphasis.
  inverted:
    "bg-secondary text-white hover:bg-secondary-500 focus-visible:ring-secondary/40 shadow-sm",
  // Outlined — bordered, neutral chrome (e.g. "View Details").
  outline:
    "bg-white text-secondary border border-neutral-300 hover:bg-blush-soft focus-visible:ring-neutral-300",
  // Ghost — minimal, for low-emphasis actions.
  ghost:
    "bg-transparent text-neutral-600 hover:bg-neutral-100 focus-visible:ring-neutral-300",
  // Danger — destructive actions (uses the primary red family).
  danger:
    "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary/40 shadow-sm",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm min-h-[36px]",
  md: "px-4 py-2.5 text-sm min-h-[44px]",
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
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-150 focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
