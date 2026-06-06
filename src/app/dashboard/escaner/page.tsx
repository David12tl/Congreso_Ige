"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode, QrcodeErrorCallback, QrcodeSuccessCallback } from "html5-qrcode";

interface ScanResponse {
  success: boolean;
  error?: string;
  code?: string;
  data?: {
    nombre: string | null;
    matricula: string | null;
    carrera: string | null;
    asiento_zona: string | null;
    asiento_fila: string | null;
    asiento_numero: number | null;
    unidad_academica: string | null;
  };
}

export default function EscanerPage() {
  const [dia, setDia] = useState<1 | 2>(1);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [manualQr, setManualQr] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const qrReaderRef = useRef<Html5Qrcode | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  // Iniciar el escáner de QR
  const startScanner = async () => {
    if (scanning || !videoRef.current) return;

    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      qrReaderRef.current = html5QrCode;

      const qrSuccessCallback: QrcodeSuccessCallback = async (decodedText) => {
        // Pausar el escáner para evitar duplicados
        await html5QrCode.pause();

        // Procesar el QR
        await procesarQR(decodedText);

        // Reanudar después de 2 segundos
        setTimeout(async () => {
          try {
            await html5QrCode.resume();
          } catch (error) {
            // Error reanudando, ignorar
          }
        }, 2000);
      };

      const qrErrorCallback: QrcodeErrorCallback = () => {
        // Ignorar errores de lectura
      };

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        qrSuccessCallback,
        qrErrorCallback
      );

      setScanning(true);
    } catch (error) {
      console.error("Error al iniciar el escáner:", error);
      alert(
        "No se pudo acceder a la cámara. Asegúrate de haber dado permiso."
      );
    }
  };

  // Detener el escáner
  const stopScanner = async () => {
    if (qrReaderRef.current && scanning) {
      try {
        await qrReaderRef.current.stop();
        qrReaderRef.current = null;
        setScanning(false);
      } catch (error) {
        console.error("Error al detener el escáner:", error);
      }
    }
  };

  // Procesar el QR (enviar a la API)
  const procesarQR = async (qrData: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/tickets/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qr_data: qrData.trim(),
          dia_a_pasar: dia,
        }),
      });

      const data: ScanResponse = await response.json();
      setResult(data);
      setShowResult(true);

      // Auto-cerrar resultado después de 5 segundos si fue exitoso
      if (data.success) {
        setTimeout(() => {
          setShowResult(false);
          setResult(null);
        }, 5000);
      }
    } catch (error) {
      console.error("Error procesando QR:", error);
      setResult({
        success: false,
        error: "Error de conexión al servidor",
        code: "NETWORK_ERROR",
      });
      setShowResult(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Procesar QR manual
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQr.trim()) return;

    await procesarQR(manualQr);
    setManualQr("");
  };

  // Cambiar día
  const handleChangeDia = (newDia: 1 | 2) => {
    setDia(newDia);
    setResult(null);
    setShowResult(false);
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (qrReaderRef.current && scanning) {
        stopScanner();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Escáner de Acceso
          </h1>
          <p className="text-gray-400">Control de ingreso - Congreso IGE</p>
        </div>

        {/* SELECTOR DE DÍA */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={() => handleChangeDia(1)}
            className={`px-8 py-4 rounded-lg font-bold text-xl transition-all ${
              dia === 1
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Día 1
          </button>
          <button
            onClick={() => handleChangeDia(2)}
            className={`px-8 py-4 rounded-lg font-bold text-xl transition-all ${
              dia === 2
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Día 2
          </button>
        </div>

        {/* RESULTADO - ACCESO CONCEDIDO */}
        {showResult && result?.success && (
          <div
            className="mb-8 p-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-pulse"
            style={{
              boxShadow: "0 0 30px rgba(34, 197, 94, 0.5)",
            }}
          >
            <div className="text-center">
              <div className="text-8xl mb-4">✓</div>
              <h2 className="text-3xl font-bold mb-6">¡ACCESO CONCEDIDO!</h2>
              <div className="bg-black/20 p-6 rounded-lg mb-4">
                <p className="text-2xl font-bold mb-4">{result.data?.nombre}</p>
                <div className="space-y-2 text-lg">
                  <p>
                    <span className="font-semibold">Matrícula:</span>{" "}
                    {result.data?.matricula || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">Carrera:</span>{" "}
                    {result.data?.carrera || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">UA:</span>{" "}
                    {result.data?.unidad_academica || "N/A"}
                  </p>
                </div>
              </div>
              <div className="bg-black/20 p-6 rounded-lg">
                <p className="text-sm mb-2 text-gray-100">Asiento asignado:</p>
                <p className="text-3xl font-bold">
                  {result.data?.asiento_zona?.toUpperCase() || "N/A"} Fila{" "}
                  {result.data?.asiento_fila} Asiento {result.data?.asiento_numero}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* RESULTADO - ERROR / FRAUDE */}
        {showResult && !result?.success && (
          <div
            className="mb-8 p-8 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white"
            style={{
              boxShadow: "0 0 30px rgba(220, 38, 38, 0.5)",
              animation: "blink 0.5s infinite",
            }}
          >
            <style>{`
              @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
              }
            `}</style>
            <div className="text-center">
              <div className="text-8xl mb-4">✕</div>
              <h2 className="text-3xl font-bold mb-4">⚠️ ACCESO DENEGADO</h2>
              <p className="text-xl font-semibold">{result?.error}</p>
              {result?.code && (
                <p className="text-sm text-red-200 mt-2">({result.code})</p>
              )}
            </div>
          </div>
        )}

        {/* CÁMARA QR */}
        <div className="mb-8">
          <div
            id="qr-reader"
            ref={videoRef}
            className="rounded-lg overflow-hidden border-4 border-blue-500 bg-black"
            style={{
              boxShadow: scanning
                ? "0 0 20px rgba(59, 130, 246, 0.5)"
                : "none",
            }}
          ></div>

          <div className="mt-4 flex gap-4">
            {!scanning ? (
              <button
                onClick={startScanner}
                disabled={isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🎥 Iniciar Cámara
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
              >
                ⏹ Detener Cámara
              </button>
            )}
          </div>
        </div>

        {/* ENTRADA MANUAL */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-white font-bold text-lg mb-4">
            Ingreso manual (opcional)
          </h3>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualQr}
              onChange={(e) => setManualQr(e.target.value)}
              placeholder="Escribir código QR aquí..."
              className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing || !manualQr.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✓ Enviar
            </button>
          </form>
        </div>

        {/* ESTADO */}
        {isProcessing && (
          <div className="mt-6 text-center text-gray-400">
            <p className="animate-pulse">Procesando...</p>
          </div>
        )}

        {scanning && !showResult && (
          <div className="mt-6 text-center text-green-400">
            <p className="text-lg font-semibold">✓ Cámara activa - Apunta al QR</p>
          </div>
        )}
      </div>
    </div>
  );
}
