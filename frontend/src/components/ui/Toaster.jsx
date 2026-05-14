import { useToast } from "../../context/ToastContext";

const VARIANT_STYLES = {
  info: "border-l-sky-500 bg-white",
  success: "border-l-emerald-500 bg-white",
  error: "border-l-red-500 bg-white",
  alert: "border-l-pulse bg-pulse/5",
};

const VARIANT_DOT = {
  info: "bg-sky-500",
  success: "bg-emerald-500",
  error: "bg-red-500",
  alert: "bg-pulse",
};

export default function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-lg border border-stone-200 border-l-4 px-4 py-3 shadow-lg ${VARIANT_STYLES[t.variant]}`}
        >
          <span
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${VARIANT_DOT[t.variant]} ${
              t.variant === "alert" ? "animate-pulse" : ""
            }`}
          />
          <div className="min-w-0 flex-1">
            {t.title && (
              <p className="text-sm font-semibold text-stone-900">{t.title}</p>
            )}
            <p className="text-sm text-stone-600">{t.message}</p>
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="shrink-0 text-stone-400 transition hover:text-stone-600"
            aria-label="Dismiss"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
