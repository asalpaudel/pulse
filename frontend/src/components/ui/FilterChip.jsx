// FilterChip — rounded-full pill button for list/search filters.
// `active` toggles the red fill. Pass an optional lucide `icon`.
export default function FilterChip({
  active = false,
  icon: Icon,
  onClick,
  className = "",
  children,
  ...rest
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
        active
          ? "bg-primary text-white"
          : "border border-neutral-200 bg-white text-neutral-700 hover:bg-blush-soft"
      } ${className}`}
      {...rest}
    >
      {Icon && <Icon size={15} strokeWidth={1.9} />}
      {children}
    </button>
  );
}
