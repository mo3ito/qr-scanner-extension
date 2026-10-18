
import { useCallback, useState } from "react";
import { useQrScanner } from "./hooks/useQrScanner";

export default function App() {
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const handleScan = useCallback((value: string) => {
    setResult(value);
    setCopied(false);
  }, []);

  const {
    videoRef,
    canvasRef,
    isActive,
    error,
    start,
    stop,
  } = useQrScanner({ onScan: handleScan });

  const isHttpUrl = (value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const openResult = () => {
    if (isHttpUrl(result)) {
      window.open(result, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <main className="w-95 bg-[#111113] p-5 text-white">
      <header className="mb-5 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-green-700">
          <svg
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3z" />
            <path d="M14 14h3v3h-3zM20 14v2M17 20h4v-3" />
          </svg>
        </div>

        <div>
          <h1 className="text-lg font-bold">QR Scanner</h1>
          <p className="text-xs text-gray-400">
            Scan QR codes quickly and easily
          </p>
        </div>

        <span
          className={`mr-auto size-2.5 rounded-full ${
            isActive ? "bg-green-400" : "bg-gray-600"
          }`}
          title={isActive ? "Camera is active" : "Camera is inactive"}
        />
      </header>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-black">
        <div className="relative aspect-4/3">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`size-full object-cover ${
              isActive ? "block" : "hidden"
            }`}
          />

          <canvas ref={canvasRef} className="hidden" />

          {!isActive && (
            <div className="flex size-full flex-col items-center justify-center gap-3 text-gray-400">
              <svg
                viewBox="0 0 24 24"
                className="size-14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              >
                <rect x="3" y="6" width="18" height="15" rx="2" />
                <circle cx="12" cy="13.5" r="4" />
                <path d="M8 6l1.5-3h5L16 6" />
              </svg>

              <p className="text-sm">Camera is not active yet</p>
            </div>
          )}

          {isActive && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative size-44">
                <span className="absolute left-0 top-0 size-8 rounded-tl-lg border-l-4 border-t-4 border-green-400" />
                <span className="absolute right-0 top-0 size-8 rounded-tr-lg border-r-4 border-t-4 border-green-400" />
                <span className="absolute bottom-0 left-0 size-8 rounded-bl-lg border-b-4 border-l-4 border-green-400" />
                <span className="absolute bottom-0 right-0 size-8 rounded-br-lg border-b-4 border-r-4 border-green-400" />
              </div>
            </div>
          )}
        </div>
      </section>

      <p className="mt-3 text-center text-xs leading-6 text-gray-400">
        {error ??
          (isActive
            ? "Position the QR code inside the frame."
            : "Click the button below to start scanning.")}
      </p>

      <div className="mt-4 flex gap-2">
        {!isActive ? (
          <button
            onClick={start}
            className="flex-1 rounded-xl bg-green-700 px-4 py-3 text-sm font-bold transition hover:bg-green-600 active:scale-[0.98]"
          >
            Enable Camera
          </button>
        ) : (
          <button
            onClick={stop}
            className="flex-1 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold transition hover:bg-white/15"
          >
            Stop Camera
          </button>
        )}
      </div>

      {result && (
        <section className="mt-5 rounded-xl border border-green-500/20 bg-green-500/4 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold">Scan Result</h2>
            <span className="text-xs text-green-400">Success</span>
          </div>

          <p
            dir="auto"
            className="max-h-24 overflow-y-auto break-all rounded-lg bg-black/30 p-3 text-sm leading-6 text-gray-200"
          >
            {result}
          </p>

          <div className="mt-3 flex gap-2">
            <button
              onClick={copyResult}
              className="flex-1 rounded-lg border border-green-500/20 px-3 py-2 text-xs font-semibold transition hover:bg-green-500/10"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>

            {isHttpUrl(result) && (
              <button
                onClick={openResult}
                className="flex-1 rounded-lg bg-green-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-green-600"
              >
                Open Link ↗
              </button>
            )}
          </div>
        </section>
      )}

      <footer className="mt-5 border-t border-white/10 pt-3 text-center text-[11px] text-gray-500">
        100% private. QR processing happens locally on your device.
      </footer>
    </main>
  );
}
