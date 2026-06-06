import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { Readable } from "stream";

export interface CredentialData {
  nombre: string;
  matricula: string;
  carrera: string;
  asiento_zona: string;
  asiento_fila: string;
  asiento_numero: number;
  qr_data: string;
  email: string;
}

/**
 * Genera un PDF de credencial con datos del alumno, asiento y código QR.
 * Retorna un Buffer del PDF generado.
 */
export async function generateCredentialPDF(
  data: CredentialData
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [612, 792], // Tamaño carta (8.5" x 11")
        margin: 40,
      });

      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on("error", reject);

      // ============ DISEÑO DEL PDF ============

      // 1. ENCABEZADO - Fondo azul oscuro
      doc.fillColor("#1a365d");
      doc.rect(0, 0, 612, 120).fill();

      // Texto del encabezado
      doc.fillColor("#ffffff");
      doc.fontSize(28);
      doc.font("Helvetica-Bold");
      doc.text("CONGRESO IGE 2026", 40, 35);

      doc.fontSize(12);
      doc.font("Helvetica");
      doc.text("Credencial de Acceso", 40, 70);

      // 2. LÍNEA SEPARADORA
      doc.fillColor("#10b981");
      doc.rect(40, 120, 532, 3).fill();

      // 3. SECCIÓN DE DATOS DEL ALUMNO
      doc.fillColor("#000000");
      let yPos = 160;

      // Nombre
      doc.fontSize(10);
      doc.font("Helvetica-Bold");
      doc.text("NOMBRE DEL ALUMNO", 40, yPos);
      yPos += 18;

      doc.fontSize(18);
      doc.font("Helvetica-Bold");
      doc.fillColor("#1a365d");
      doc.text(data.nombre, 40, yPos, { width: 450 });
      yPos += 35;

      // Línea separadora
      doc.fillColor("#e5e7eb");
      doc.rect(40, yPos, 532, 1).fill();
      yPos += 15;

      // 3 columnas: Matrícula, Carrera, UA
      doc.fillColor("#000000");
      doc.fontSize(9);
      doc.font("Helvetica-Bold");

      // Columna 1: Matrícula
      doc.text("MATRÍCULA", 40, yPos);
      doc.fontSize(12);
      doc.font("Helvetica");
      doc.fillColor("#1a365d");
      doc.text(data.matricula || "N/A", 40, yPos + 15);

      // Columna 2: Carrera
      doc.fillColor("#000000");
      doc.fontSize(9);
      doc.font("Helvetica-Bold");
      doc.text("CARRERA", 250, yPos);
      doc.fontSize(12);
      doc.font("Helvetica");
      doc.fillColor("#1a365d");
      doc.text(data.carrera || "N/A", 250, yPos + 15, { width: 150 });

      yPos += 50;

      // Línea separadora
      doc.fillColor("#e5e7eb");
      doc.rect(40, yPos, 532, 1).fill();
      yPos += 20;

      // 4. SECCIÓN DE ASIENTO - MÁS GRANDE
      doc.fillColor("#000000");
      doc.fontSize(10);
      doc.font("Helvetica-Bold");
      doc.text("ASIENTO ASIGNADO", 40, yPos);
      yPos += 20;

      // Caja de asiento con fondo claro
      doc.fillColor("#f3f4f6");
      doc.rect(40, yPos, 532, 80).fill();

      // Borde verde
      doc.strokeColor("#10b981");
      doc.lineWidth(2);
      doc.rect(40, yPos, 532, 80).stroke();

      // Texto del asiento
      doc.fillColor("#1a365d");
      doc.fontSize(14);
      doc.font("Helvetica-Bold");
      doc.text(
        `${data.asiento_zona.toUpperCase()} • Fila ${data.asiento_fila}`,
        50,
        yPos + 15
      );

      doc.fontSize(28);
      doc.font("Helvetica-Bold");
      doc.text(`Asiento ${data.asiento_numero}`, 50, yPos + 35);

      yPos += 100;

      // Línea separadora
      doc.fillColor("#e5e7eb");
      doc.rect(40, yPos, 532, 1).fill();
      yPos += 20;

      // 5. CÓDIGO QR
      // Generar QR como data URL
      const qrImage = await QRCode.toDataURL(data.qr_data, {
        width: 150,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      // Insertar el QR
      const qrX = 412; // Derecha
      const qrY = yPos;
      doc.image(qrImage, qrX, qrY, { width: 120, height: 120 });

      // Texto junto al QR
      doc.fillColor("#000000");
      doc.fontSize(9);
      doc.font("Helvetica-Bold");
      doc.text("CÓDIGO DE ACCESO", 50, yPos);

      doc.fontSize(10);
      doc.font("Helvetica-Oblique");
      doc.fillColor("#666666");
      doc.text(
        data.qr_data.substring(0, 24),
        50,
        yPos + 20,
        { width: 320 }
      );
      doc.text(`...`, 50, yPos + 38);

      yPos += 140;

      // Línea separadora
      doc.fillColor("#e5e7eb");
      doc.rect(40, yPos, 532, 1).fill();
      yPos += 15;

      // 6. INSTRUCCIONES DE ACCESO
      doc.fillColor("#7c3aed");
      doc.fontSize(10);
      doc.font("Helvetica-Bold");
      doc.text(
        "Instrucciones de Acceso",
        40,
        yPos
      );

      doc.fillColor("#000000");
      doc.fontSize(9);
      doc.font("Helvetica");
      yPos += 20;

      const instructions = [
        "1. Presenta esta credencial en la puerta de entrada",
        "2. El staff escaneará el código QR de tu asiento",
        "3. Se registrará tu asistencia automáticamente",
        "4. Dirígete a tu asiento indicado arriba",
      ];

      instructions.forEach((instruction) => {
        doc.text(instruction, 50, yPos);
        yPos += 15;
      });

      // 7. FOOTER
      yPos += 20;
      doc.fillColor("#999999");
      doc.fontSize(8);
      doc.text(
        `Credencial digital generada automáticamente • ${new Date().toLocaleDateString(
          "es-MX"
        )}`,
        40,
        yPos,
        {
          align: "center",
          width: 532,
        }
      );

      // Finalizar documento
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
