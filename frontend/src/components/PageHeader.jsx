// PageHeader — page title + optional subtitle and right-aligned action.
export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-secondary">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// Re-export StatCard from the ui kit so existing imports
// `import PageHeader, { StatCard } from ".../PageHeader"` keep working.
export { default as StatCard } from "./ui/StatCard";
