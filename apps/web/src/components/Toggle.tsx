import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';

export function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => {
        haptic('select');
        onChange(!checked);
      }}
      className={cn(
        'relative h-7 w-12 shrink-0 rounded-pill transition-colors duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia',
        checked ? 'bg-gradient-to-r from-violet to-fuchsia' : 'bg-white/10',
        disabled && 'pointer-events-none opacity-40',
      )}
    >
      <span
        className={cn(
          // left-1 is required: without an explicit offset the knob falls back to
          // its static position, which a centred <button> resolves to the middle.
          'absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}
