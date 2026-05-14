export function Table({ children, className = "" }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function THead({ columns }) {
  return (
    <thead>
      <tr className="border-b border-stone-200 text-left">
        {columns.map((c) => (
          <th
            key={c}
            className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-stone-500"
          >
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-stone-100">{children}</tbody>;
}

export function TR({ children, className = "", ...rest }) {
  return (
    <tr className={`hover:bg-stone-50 ${className}`} {...rest}>
      {children}
    </tr>
  );
}

export function TD({ children, className = "" }) {
  return <td className={`px-4 py-3 text-stone-700 ${className}`}>{children}</td>;
}

export function EmptyRow({ colSpan, message = "Nothing here yet." }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-4 py-10 text-center text-sm text-stone-400"
      >
        {message}
      </td>
    </tr>
  );
}
