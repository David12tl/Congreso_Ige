import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailCredentialData {
  email: string;
  nombre: string;
  pdfBuffer: Buffer;
  ticketId: string;
}

/**
 * Envía el PDF de credencial al correo del alumno mediante Resend
 */
export async function sendCredentialEmail(
  data: EmailCredentialData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Convertir buffer a base64 para adjuntar
    const pdfBase64 = data.pdfBuffer.toString("base64");

    const response = await resend.emails.send({
      from: "congreso@ige.edu.mx", // Cambiar al email configurado en Resend
      to: data.email,
      subject: "Tu Credencial de Acceso - Congreso IGE 2026",
      html: generateCredentialEmail(data.nombre),
      attachments: [
        {
          filename: `Credencial_${data.nombre.replace(/\s+/g, "_")}.pdf`,
          content: pdfBase64,
        },
      ],
    });

    if (response.error) {
      console.error("Error enviando email con Resend:", response.error);
      return {
        success: false,
        error: response.error.message || "Error desconocido al enviar email",
      };
    }

    return {
      success: true,
      messageId: response.data?.id,
    };
  } catch (error) {
    console.error("Error en sendCredentialEmail:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Genera el HTML del email con la credencial
 */
function generateCredentialEmail(nombre: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f3f4f6;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #1a365d 0%, #2d5a8c 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .content {
            padding: 30px;
            color: #333;
          }
          .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            line-height: 1.6;
          }
          .greeting strong {
            color: #1a365d;
            font-size: 18px;
          }
          .divider {
            border-top: 2px solid #10b981;
            margin: 20px 0;
          }
          .info-box {
            background-color: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-box strong {
            color: #059669;
          }
          .instructions {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .instructions h3 {
            margin-top: 0;
            color: #1a365d;
            font-size: 14px;
            text-transform: uppercase;
            font-weight: bold;
          }
          .instructions ol {
            margin: 15px 0;
            padding-left: 20px;
          }
          .instructions li {
            margin-bottom: 10px;
            line-height: 1.6;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin-top: 20px;
            text-align: center;
          }
          .footer {
            background-color: #f3f4f6;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e5e7eb;
          }
          .highlight {
            color: #10b981;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Congreso IGE 2026</h1>
            <p>Tu Credencial de Acceso</p>
          </div>

          <div class="content">
            <div class="greeting">
              ¡Hola <strong>${nombre}</strong>!
            </div>

            <p>
              Nos complace confirmarte que tu registro en el <span class="highlight">Congreso IGE 2026</span> ha sido completado exitosamente.
            </p>

            <div class="info-box">
              <strong>✓ Tu Credencial Está Lista</strong><br>
              Adjunto encontrarás tu credencial de acceso en formato PDF. Esta contiene tu código QR único y tu asiento asignado.
            </div>

            <div class="divider"></div>

            <div class="instructions">
              <h3>Instrucciones de Acceso</h3>
              <ol>
                <li>
                  <strong>Descarga tu credencial:</strong> 
                  El PDF adjunto contiene tu código QR y datos personales.
                </li>
                <li>
                  <strong>En la puerta de acceso:</strong> 
                  Presenta tu credencial con el código QR visible.
                </li>
                <li>
                  <strong>Escaneo rápido:</strong> 
                  El personal de entrada escaneará tu QR para registrar tu asistencia.
                </li>
                <li>
                  <strong>Dirige a tu asiento:</strong> 
                  Tu asiento está claramente indicado en la credencial.
                </li>
              </ol>
            </div>

            <div class="divider"></div>

            <p style="font-size: 14px; color: #666;">
              <strong>📌 Importante:</strong>
              Asegúrate de tener tu credencial a mano durante los días del congreso. 
              Puedes mostrarla en tu teléfono (digital) o imprimirla.
            </p>

            <p style="font-size: 14px; color: #666;">
              Si tienes preguntas o necesitas ayuda, no dudes en contactarnos a través del sitio del congreso.
            </p>

            <p style="margin-top: 30px;">
              ¡Te esperamos en el <span class="highlight">Congreso IGE 2026</span>!
            </p>
          </div>

          <div class="footer">
            <p style="margin: 0;">
              Este email fue generado automáticamente. Por favor, no respondas a este mensaje.
            </p>
            <p style="margin: 5px 0 0 0; opacity: 0.7;">
              Congreso IGE 2026 © ${new Date().getFullYear()}
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
