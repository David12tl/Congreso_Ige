export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      events: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          location: string | null
          maps_link: string | null
          name: string
          start_date: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          location?: string | null
          maps_link?: string | null
          name: string
          start_date: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          location?: string | null
          maps_link?: string | null
          name?: string
          start_date?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          id_rol: number
          unidad_academica_id: number | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          id_rol?: number
          unidad_academica_id?: number | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          id_rol?: number
          unidad_academica_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_rol_fkey"
            columns: ["id_rol"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id_rol"]
          },
          {
            foreignKeyName: "profiles_unidad_academica_id_fkey"
            columns: ["unidad_academica_id"]
            isOneToOne: false
            referencedRelation: "unidades_academicas"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          created_at: string | null
          id: string
          status: string
          stripe_session_id: string
          total: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string
          stripe_session_id: string
          total: number
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string
          stripe_session_id?: string
          total?: number
        }
        Relationships: []
      }
      roles: {
        Row: {
          descripcion: string | null
          id_rol: number
          nivel_acceso: number | null
          nombre_rol: string
        }
        Insert: {
          descripcion?: string | null
          id_rol?: number
          nivel_acceso?: number | null
          nombre_rol: string
        }
        Update: {
          descripcion?: string | null
          id_rol?: number
          nivel_acceso?: number | null
          nombre_rol?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          asiento_bloque: string | null
          asiento_fila: string | null
          asiento_numero: number | null
          asiento_zona: string | null
          attended_day1: boolean | null
          attended_day1_at: string | null
          attended_day2: boolean | null
          attended_day2_at: string | null
          buyer_id: string
          carrera: string | null
          email: string
          empresa: string | null
          event_id: string | null
          id: string
          matricula: string | null
          nombre: string | null
          pdf_path: string | null
          purchase_id: string | null
          purchased_at: string | null
          qr_data: string | null
          semestre: string | null
          telefono: string | null
          type: string
          unidad_academica_id: number | null
          zone_id: string | null
        }
        Insert: {
          asiento_bloque?: string | null
          asiento_fila?: string | null
          asiento_numero?: number | null
          asiento_zona?: string | null
          attended_day1?: boolean | null
          attended_day1_at?: string | null
          attended_day2?: boolean | null
          attended_day2_at?: string | null
          buyer_id: string
          carrera?: string | null
          email: string
          empresa?: string | null
          event_id?: string | null
          id?: string
          matricula?: string | null
          nombre?: string | null
          pdf_path?: string | null
          purchase_id?: string | null
          purchased_at?: string | null
          qr_data?: string | null
          semestre?: string | null
          telefono?: string | null
          type: string
          unidad_academica_id?: number | null
          zone_id?: string | null
        }
        Update: {
          asiento_bloque?: string | null
          asiento_fila?: string | null
          asiento_numero?: number | null
          asiento_zona?: string | null
          attended_day1?: boolean | null
          attended_day1_at?: string | null
          attended_day2?: boolean | null
          attended_day2_at?: string | null
          buyer_id?: string
          carrera?: string | null
          email?: string
          empresa?: string | null
          event_id?: string | null
          id?: string
          matricula?: string | null
          nombre?: string | null
          pdf_path?: string | null
          purchase_id?: string | null
          purchased_at?: string | null
          qr_data?: string | null
          semestre?: string | null
          telefono?: string | null
          type?: string
          unidad_academica_id?: number | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_unidad_academica_id_fkey"
            columns: ["unidad_academica_id"]
            isOneToOne: false
            referencedRelation: "unidades_academicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens_canje: {
        Row: {
          creado_por: string
          created_at: string | null
          estado_pago: Database["public"]["Enums"]["estado_pago_enum"] | null
          event_id: string
          id: string
          status: string
          token_code: string
          total_abonado: number | null
          utilizado_el: string | null
          utilizado_por: string | null
          zone_id: string
        }
        Insert: {
          creado_por: string
          created_at?: string | null
          estado_pago?: Database["public"]["Enums"]["estado_pago_enum"] | null
          event_id: string
          id?: string
          status?: string
          token_code: string
          total_abonado?: number | null
          utilizado_el?: string | null
          utilizado_por?: string | null
          zone_id: string
        }
        Update: {
          creado_por?: string
          created_at?: string | null
          estado_pago?: Database["public"]["Enums"]["estado_pago_enum"] | null
          event_id?: string
          id?: string
          status?: string
          token_code?: string
          total_abonado?: number | null
          utilizado_el?: string | null
          utilizado_por?: string | null
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tokens_canje_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokens_canje_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokens_canje_utilizado_por_fkey"
            columns: ["utilizado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokens_canje_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      unidades_academicas: {
        Row: {
          created_at: string | null
          id: number
          nombre: string
          tipo: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          nombre: string
          tipo: string
        }
        Update: {
          created_at?: string | null
          id?: number
          nombre?: string
          tipo?: string
        }
        Relationships: []
      }
      zones: {
        Row: {
          available: number
          capacity: number
          codigo_color: string | null
          event_id: string
          id: string
          image_url: string | null
          name: string
          price: number
          total_bloques: number | null
        }
        Insert: {
          available: number
          capacity: number
          codigo_color?: string | null
          event_id: string
          id?: string
          image_url?: string | null
          name: string
          price: number
          total_bloques?: number | null
        }
        Update: {
          available?: number
          capacity?: number
          codigo_color?: string | null
          event_id?: string
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          total_bloques?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "zones_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      canjear_token_por_ticket: {
        Args: {
          p_carrera?: string
          p_email: string
          p_empresa?: string
          p_matricula?: string
          p_nombre: string
          p_semestre?: string
          p_tipo_ticket: string
          p_token_code: string
          p_user_id: string
        }
        Returns: string
      }
      get_user_nivel: { Args: never; Returns: number }
      get_user_role_name: { Args: never; Returns: string }
    }
    Enums: {
      estado_pago_enum: "sin_pago" | "faltante" | "completado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      estado_pago_enum: ["sin_pago", "faltante", "completado"],
    },
  },
} as const
