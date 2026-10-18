import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

type UseQrScannerOptions = {
  onScan: (value: string) => void;
};

export function useQrScanner({ onScan }: UseQrScannerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // استفاده از ref برای جلوگیری از بازآفرینی بیهوده و قطع شدن استریم
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const isScanningRef = useRef(false);
  const onScanRef = useRef(onScan);

  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const stop = useCallback(() => {
    isScanningRef.current = false;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
  }, []);

  const start = useCallback(async () => {
    // اگر قبلاً روشن شده یا در حال اسکن است، دوباره اجرا نکن
    if (streamRef.current || isScanningRef.current) return;

    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("مرورگر امکان دسترسی به دوربین را فراهم نمی‌کند.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        // اگر ویدیورف آماده نبود، استریم را قطع کن
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        return;
      }

      video.srcObject = stream;
      video.setAttribute("playsinline", "true");

      // منتظر لود شدن کامل متادیتای ویدیو بمان تا ابعاد مشخص شود
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          resolve();
        };
      });

      await video.play();

      isScanningRef.current = true;
      setIsActive(true);

      // حلقه پردازش فریم‌های تصویر
      const scanFrame = () => {
        if (!isScanningRef.current) return;

        const currentVideo = videoRef.current;
        const currentCanvas = canvasRef.current;

        if (
          currentVideo &&
          currentCanvas &&
          currentVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
          currentVideo.videoWidth > 0 &&
          currentVideo.videoHeight > 0
        ) {
          const context = currentCanvas.getContext("2d", { willReadFrequently: true });
          if (context) {
            currentCanvas.width = currentVideo.videoWidth;
            currentCanvas.height = currentVideo.videoHeight;

            context.drawImage(
              currentVideo,
              0,
              0,
              currentCanvas.width,
              currentCanvas.height
            );

            const imageData = context.getImageData(
              0,
              0,
              currentCanvas.width,
              currentCanvas.height
            );

            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });

            // فقط وقتی کدی واقعاً پیدا شد و خالی نبود
            if (code && typeof code.data === "string" && code.data.trim() !== "") {
              isScanningRef.current = false;
              onScanRef.current(code.data);
              stop();
              return;
            }
          }
        }

        // ادامه اسکن برای فریم بعدی
        frameRef.current = requestAnimationFrame(scanFrame);
      };

      frameRef.current = requestAnimationFrame(scanFrame);
    } catch (err) {
      console.error("Camera error:", err);

      let message = "خطا در دسترسی به دوربین.";
      if (err instanceof Error) {
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          message = "دسترسی به دوربین رد شد. لطفاً در تنظیمات مرورگر اجازه دهید.";
        } else if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          message = "هیچ دوربینی روی دستگاه یافت نشد.";
        } else if (
          err.name === "NotReadableError" ||
          err.name === "TrackStartError"
        ) {
          message = "دوربین توسط برنامه‌ی دیگری در حال استفاده است.";
        } else {
          message = `${err.name}: ${err.message}`;
        }
      }

      setError(message);
      stop();
    }
  }, [stop]);

  // زمان Unmount شدن کامپوننت استریم را متوقف کن
  useEffect(() => {
    return () => {
      isScanningRef.current = false;
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    isActive,
    error,
    start,
    stop,
  };
}
