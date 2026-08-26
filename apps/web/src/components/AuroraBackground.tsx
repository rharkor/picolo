/**
 * Three slow-drifting colour blobs behind everything. Pure CSS animation so it
 * costs nothing on a phone, and it is killed by prefers-reduced-motion.
 */
export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-ink" />
      <div
        className="absolute -top-1/4 -left-1/4 h-[70vmax] w-[70vmax] rounded-full opacity-40 blur-[90px]"
        style={{
          background: 'radial-gradient(circle, var(--color-violet), transparent 62%)',
          animation: 'float-slow 26s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-1/3 -right-1/4 h-[60vmax] w-[60vmax] rounded-full opacity-35 blur-[90px]"
        style={{
          background: 'radial-gradient(circle, var(--color-fuchsia), transparent 62%)',
          animation: 'float-slow 32s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute -bottom-1/4 left-1/4 h-[55vmax] w-[55vmax] rounded-full opacity-25 blur-[90px]"
        style={{
          background: 'radial-gradient(circle, var(--color-amber), transparent 65%)',
          animation: 'float-slow 38s ease-in-out infinite',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/10 via-ink/50 to-ink" />
    </div>
  );
}
