export function Input({ label, error, hint, className = "", id, ...rest }) {
  const inputId = id || rest.name;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-secondary"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        className={`w-full rounded-xl border bg-white px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 transition focus:outline-none focus:ring-2 ${
          error
            ? "border-primary-400 focus:ring-primary-300"
            : "border-neutral-300 focus:border-primary focus:ring-primary/30"
        }`}
        {...rest}
      />
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-neutral-600">{hint}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-primary-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function Select({ label, error, hint, children, className = "", id, ...rest }) {
  const inputId = id || rest.name;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-secondary"
        >
          {label}
        </label>
      )}
      <select
        id={inputId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        className={`w-full rounded-xl border bg-white px-3 py-2 text-sm text-neutral-800 transition focus:outline-none focus:ring-2 ${
          error
            ? "border-primary-400 focus:ring-primary-300"
            : "border-neutral-300 focus:border-primary focus:ring-primary/30"
        }`}
        {...rest}
      >
        {children}
      </select>
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-neutral-600">{hint}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-primary-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function Textarea({ label, error, hint, className = "", id, ...rest }) {
  const inputId = id || rest.name;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-secondary"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        className={`w-full rounded-xl border bg-white px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 transition focus:outline-none focus:ring-2 ${
          error
            ? "border-primary-400 focus:ring-primary-300"
            : "border-neutral-300 focus:border-primary focus:ring-primary/30"
        }`}
        {...rest}
      />
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-neutral-600">{hint}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-primary-600">
          {error}
        </p>
      )}
    </div>
  );
}
