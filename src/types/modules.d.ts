// Tipos TypeScript para módulos sin tipos
declare module 'qrcode' {
  export function toDataURL(
    text: string,
    options?: Record<string, unknown>
  ): Promise<string>;
  export namespace QRCode {
    interface QRCodeToStringOptions {
      version?: number;
      errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
      type?: 'image/png' | 'image/jpeg' | 'image/webp';
      width?: number;
      margin?: number;
      scale?: number;
      color?: {
        dark?: string;
        light?: string;
      };
    }
  }
}

declare module "pdfkit/js/pdfkit.standalone" {
  import PDFDocument from "pdfkit";
  export default PDFDocument;
}
