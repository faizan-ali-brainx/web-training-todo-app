// Shared loading indicator shown while an async request is in flight.
// Styled with Tailwind utilities directly (no CSS Module needed) — a small,
// self-contained visual with no component-specific selectors/animations
// beyond what Tailwind's own `animate-spin` already provides.
export function Spinner() {
  return (
    <div
      className="mx-auto my-8 h-[24px] w-[24px] animate-spin rounded-full border-[3px] border-[var(--border)] border-t-[var(--accent)]"
      role="status"
      aria-label="Loading"
    />
  );
}
