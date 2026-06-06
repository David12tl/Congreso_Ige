// Tipos TypeScript para módulos sin tipos
declare module 'qrcode' {
  export function toDataURL(
    text: string,
    options?: any
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
