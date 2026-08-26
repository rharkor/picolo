import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

/** Renders a QR as a data URL — no canvas juggling, scales crisply on a TV. */
export function QrCode({ value, size = 220 }: { value: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0b0910ff', light: '#ffffffff' },
    })
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => setSrc(null));
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return (
    <div
      className="grid place-items-center overflow-hidden rounded-2xl bg-white p-2"
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={value} width={size - 16} height={size - 16} />
      ) : (
        <span className="text-xs text-ink">…</span>
      )}
    </div>
  );
}
