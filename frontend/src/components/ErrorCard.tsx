export default function ErrorCard({ title, message, onRetry }: { title?: string; message?: string | null; onRetry?: () => void }) {
  return (
    <div className="card mx-auto max-w-[720px] text-center">
      {title && <div className="text-lg font-semibold">{title}</div>}
      {message && <div className="mt-2 text-sm text-zinc-400">{message}</div>}
      {onRetry && (
        <div className="mt-4">
          <button className="btn" onClick={onRetry}>Retry</button>
        </div>
      )}
    </div>
  );
}
