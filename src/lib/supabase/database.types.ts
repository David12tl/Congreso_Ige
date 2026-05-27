/* eslint-disable @typescript-eslint/no-empty-object-type */

// Genera estos tipos ejecutando:
// npx supabase gen types typescript --project-id qlooliqdifsrdqacxzjw --schema public > src/lib/supabase/database.types.ts

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonValue[];

export type JsonObject = { [key: string]: JsonValue | undefined };

export type Database = {
  public: {
    Tables: {
      // TODO: Define aquí los tipos de tus tablas una vez generados
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  T extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][T] extends {
  Insert: infer I;
}
  ? I
  : never;

export type TablesUpdate<
  T extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][T] extends {
  Update: infer U;
}
  ? U
  : never;