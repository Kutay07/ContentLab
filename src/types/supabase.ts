export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      component_types: {
        Row: {
          content_template: Json | null;
          created_at: string | null;
          description: string | null;
          display_name: string;
          estimated_duration_minutes: number | null;
          icon_family: string | null;
          icon_key: string | null;
          id: string;
          is_active: boolean | null;
          type_key: string;
          updated_at: string | null;
        };
        Insert: {
          content_template?: Json | null;
          created_at?: string | null;
          description?: string | null;
          display_name: string;
          estimated_duration_minutes?: number | null;
          icon_family?: string | null;
          icon_key?: string | null;
          id?: string;
          is_active?: boolean | null;
          type_key: string;
          updated_at?: string | null;
        };
        Update: {
          content_template?: Json | null;
          created_at?: string | null;
          description?: string | null;
          display_name?: string;
          estimated_duration_minutes?: number | null;
          icon_family?: string | null;
          icon_key?: string | null;
          id?: string;
          is_active?: boolean | null;
          type_key?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      components: {
        Row: {
          content: Json;
          created_at: string | null;
          id: string;
          level_id: string | null;
          order: number;
          type: string;
        };
        Insert: {
          content: Json;
          created_at?: string | null;
          id?: string;
          level_id?: string | null;
          order: number;
          type: string;
        };
        Update: {
          content?: Json;
          created_at?: string | null;
          id?: string;
          level_id?: string | null;
          order?: number;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "components_level_id_fkey";
            columns: ["level_id"];
            isOneToOne: false;
            referencedRelation: "levels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_components_type";
            columns: ["type"];
            isOneToOne: false;
            referencedRelation: "component_types";
            referencedColumns: ["type_key"];
          }
        ];
      };
      daily_streaks: {
        Row: {
          created_at: string | null;
          id: string;
          streak_date: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          streak_date: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          streak_date?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "daily_streaks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      level_groups: {
        Row: {
          created_at: string | null;
          id: string;
          order: number;
          title: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          order: number;
          title: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          order?: number;
          title?: string;
        };
        Relationships: [];
      };
      levels: {
        Row: {
          created_at: string | null;
          group_id: string | null;
          icon_family: string | null;
          icon_key: string | null;
          id: string;
          order: number;
          title: string;
          xp_reward: number;
        };
        Insert: {
          created_at?: string | null;
          group_id?: string | null;
          icon_family?: string | null;
          icon_key?: string | null;
          id?: string;
          order: number;
          title: string;
          xp_reward?: number;
        };
        Update: {
          created_at?: string | null;
          group_id?: string | null;
          icon_family?: string | null;
          icon_key?: string | null;
          id?: string;
          order?: number;
          title?: string;
          xp_reward?: number;
        };
        Relationships: [
          {
            foreignKeyName: "levels_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "level_groups";
            referencedColumns: ["id"];
          }
        ];
      };
      user_level_progress: {
        Row: {
          achievements_unlocked: string[] | null;
          badges_earned: string[] | null;
          completed_at: string | null;
          completion_percentage: number | null;
          completion_score: number | null;
          completion_time_seconds: number | null;
          created_at: string | null;
          first_completion_at: string | null;
          id: string;
          is_completed: boolean | null;
          last_accessed_at: string | null;
          level_id: string | null;
          total_xp_earned: number | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          achievements_unlocked?: string[] | null;
          badges_earned?: string[] | null;
          completed_at?: string | null;
          completion_percentage?: number | null;
          completion_score?: number | null;
          completion_time_seconds?: number | null;
          created_at?: string | null;
          first_completion_at?: string | null;
          id?: string;
          is_completed?: boolean | null;
          last_accessed_at?: string | null;
          level_id?: string | null;
          total_xp_earned?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          achievements_unlocked?: string[] | null;
          badges_earned?: string[] | null;
          completed_at?: string | null;
          completion_percentage?: number | null;
          completion_score?: number | null;
          completion_time_seconds?: number | null;
          created_at?: string | null;
          first_completion_at?: string | null;
          id?: string;
          is_completed?: boolean | null;
          last_accessed_at?: string | null;
          level_id?: string | null;
          total_xp_earned?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_level_progress_level_id_fkey";
            columns: ["level_id"];
            isOneToOne: false;
            referencedRelation: "levels";
            referencedColumns: ["id"];
          }
        ];
      };
      user_profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          lessons_completed: number | null;
          total_xp: number | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id: string;
          lessons_completed?: number | null;
          total_xp?: number | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          lessons_completed?: number | null;
          total_xp?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
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

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
