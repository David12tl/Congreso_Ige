import { createClient } from "@/lib/supabase/server";

const CREDENTIALS_BUCKET = "credentials";

export interface CredentialStorageResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * Sube el PDF de credencial a Supabase Storage
 * Retorna la URL pública para acceso
 */
export async function uploadCredentialPDF(
  pdfBuffer: Buffer,
  fileName: string
): Promise<CredentialStorageResult> {
  try {
    const supabase = await createClient();

    // Crear nombre de archivo único
    const timestamp = Date.now();
    const filePath = `credentials/${timestamp}_${fileName}`;

    // Subir el archivo
    const { data, error } = await supabase.storage
      .from(CREDENTIALS_BUCKET)
      .upload(filePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (error) {
      console.error("Error subiendo PDF a Supabase Storage:", error);
      return {
        success: false,
        error: error.message || "Error subiendo archivo",
      };
    }

    // Obtener URL pública del archivo
    const { data: publicUrlData } = supabase.storage
      .from(CREDENTIALS_BUCKET)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error("Error en uploadCredentialPDF:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Elimina un PDF de credencial de Storage (útil para limpiar)
 */
export async function deleteCredentialPDF(
  filePath: string
): Promise<CredentialStorageResult> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.storage
      .from(CREDENTIALS_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error("Error eliminando PDF:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error en deleteCredentialPDF:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
