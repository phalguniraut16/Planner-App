// Auto-generated TypeScript types for Supabase Database.
// Run: npx supabase gen types typescript --local > src/types/database.ts
// This file mirrors the SQL migration at supabase/migrations/001_initial_schema.sql

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          email: string | null;
          time_zone: string;
          currency: string;
          date_format: string;
          week_starts_on: number;
          onboarding_completed: boolean;
          working_hours_start: string;
          working_hours_end: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          email?: string | null;
          time_zone?: string;
          currency?: string;
          date_format?: string;
          week_starts_on?: number;
          onboarding_completed?: boolean;
          working_hours_start?: string;
          working_hours_end?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          email?: string | null;
          time_zone?: string;
          currency?: string;
          date_format?: string;
          week_starts_on?: number;
          onboarding_completed?: boolean;
          working_hours_start?: string;
          working_hours_end?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          theme: string;
          notifications_enabled: boolean;
          default_task_priority: string;
          dashboard_widgets: any;
          week_starts_on: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: string;
          notifications_enabled?: boolean;
          default_task_priority?: string;
          dashboard_widgets?: any;
          week_starts_on?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme?: string;
          notifications_enabled?: boolean;
          default_task_priority?: string;
          dashboard_widgets?: any;
          week_starts_on?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          status: string;
          priority: string;
          category: string | null;
          project_id: string | null;
          due_date: string | null;
          due_time: string | null;
          start_date: string | null;
          estimated_duration: number | null;
          actual_duration: number | null;
          recurrence_rule: string | null;
          reminder_settings: any;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          status?: string;
          priority?: string;
          category?: string | null;
          project_id?: string | null;
          due_date?: string | null;
          due_time?: string | null;
          start_date?: string | null;
          estimated_duration?: number | null;
          actual_duration?: number | null;
          recurrence_rule?: string | null;
          reminder_settings?: any;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          status?: string;
          priority?: string;
          category?: string | null;
          project_id?: string | null;
          due_date?: string | null;
          due_time?: string | null;
          start_date?: string | null;
          estimated_duration?: number | null;
          actual_duration?: number | null;
          recurrence_rule?: string | null;
          reminder_settings?: any;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      task_subtasks: {
        Row: {
          id: string;
          task_id: string;
          title: string;
          is_completed: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          title: string;
          is_completed?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          title?: string;
          is_completed?: boolean;
          sort_order?: number;
          created_at?: string;
        };
      };
      task_tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          created_at?: string;
        };
      };
      task_tag_assignments: {
        Row: {
          id: string;
          task_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          tag_id?: string;
          created_at?: string;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          icon: string;
          category: string | null;
          start_date: string;
          frequency: string;
          target_quantity: number;
          target_unit: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          icon?: string;
          category?: string | null;
          start_date?: string;
          frequency?: string;
          target_quantity?: number;
          target_unit?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          icon?: string;
          category?: string | null;
          start_date?: string;
          frequency?: string;
          target_quantity?: number;
          target_unit?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          completed_at: string;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          completed_at: string;
          quantity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          completed_at?: string;
          quantity?: number;
          created_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          user_id: string;
          code: string | null;
          name: string;
          instructor: string | null;
          semester: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          code?: string | null;
          name: string;
          instructor?: string | null;
          semester?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          code?: string | null;
          name?: string;
          instructor?: string | null;
          semester?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      assignments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string | null;
          title: string;
          description: string | null;
          due_date: string | null;
          status: string;
          grade: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id?: string | null;
          title: string;
          description?: string | null;
          due_date?: string | null;
          status?: string;
          grade?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string | null;
          title?: string;
          description?: string | null;
          due_date?: string | null;
          status?: string;
          grade?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          course_id: string | null;
          title: string;
          scheduled_at: string | null;
          duration_minutes: number | null;
          actual_duration_minutes: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id?: string | null;
          title: string;
          scheduled_at?: string | null;
          duration_minutes?: number | null;
          actual_duration_minutes?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string | null;
          title?: string;
          scheduled_at?: string | null;
          duration_minutes?: number | null;
          actual_duration_minutes?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          start_at: string;
          end_at: string;
          category: string | null;
          color: string;
          is_all_day: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          start_at: string;
          end_at: string;
          category?: string | null;
          color?: string;
          is_all_day?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          start_at?: string;
          end_at?: string;
          category?: string | null;
          color?: string;
          is_all_day?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string | null;
          start_date: string;
          target_date: string | null;
          progress: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category?: string | null;
          start_date?: string;
          target_date?: string | null;
          progress?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: string | null;
          start_date?: string;
          target_date?: string | null;
          progress?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      goal_milestones: {
        Row: {
          id: string;
          goal_id: string;
          title: string;
          due_date: string | null;
          is_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          title: string;
          due_date?: string | null;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          goal_id?: string;
          title?: string;
          due_date?: string | null;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          status: string;
          deadline: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          status?: string;
          deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          status?: string;
          deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_milestones: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          due_date: string | null;
          is_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          due_date?: string | null;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          due_date?: string | null;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          amount_cents: number;
          currency: string;
          transaction_date: string;
          category: string | null;
          payment_method: string | null;
          account: string | null;
          description: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          amount_cents: number;
          currency?: string;
          transaction_date?: string;
          category?: string | null;
          payment_method?: string | null;
          account?: string | null;
          description?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          amount_cents?: number;
          currency?: string;
          transaction_date?: string;
          category?: string | null;
          payment_method?: string | null;
          account?: string | null;
          description?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      budget_categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          monthly_limit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          monthly_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          monthly_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          month: string;
          limit_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          month: string;
          limit_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          month?: string;
          limit_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      savings_goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount: number;
          target_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          target_amount?: number;
          current_amount?: number;
          target_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          target_amount?: number;
          current_amount?: number;
          target_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          content: string | null;
          is_pinned: boolean;
          is_archived: boolean;
          tags: string[];
          linked_task_id: string | null;
          linked_course_id: string | null;
          linked_project_id: string | null;
          linked_goal_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          content?: string | null;
          is_pinned?: boolean;
          is_archived?: boolean;
          tags?: string[];
          linked_task_id?: string | null;
          linked_course_id?: string | null;
          linked_project_id?: string | null;
          linked_goal_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          content?: string | null;
          is_pinned?: boolean;
          is_archived?: boolean;
          tags?: string[];
          linked_task_id?: string | null;
          linked_course_id?: string | null;
          linked_project_id?: string | null;
          linked_goal_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string | null;
          type: string;
          is_read: boolean;
          scheduled_for: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body?: string | null;
          type?: string;
          is_read?: boolean;
          scheduled_for?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          body?: string | null;
          type?: string;
          is_read?: boolean;
          scheduled_for?: string | null;
          created_at?: string;
        };
      };
      daily_plans: {
        Row: {
          id: string;
          user_id: string;
          plan_date: string;
          intentions: string | null;
          priorities: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_date: string;
          intentions?: string | null;
          priorities?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_date?: string;
          intentions?: string | null;
          priorities?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      daily_reviews: {
        Row: {
          id: string;
          user_id: string;
          review_date: string;
          achievements: string | null;
          reflections: string | null;
          rating: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          review_date: string;
          achievements?: string | null;
          reflections?: string | null;
          rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          review_date?: string;
          achievements?: string | null;
          reflections?: string | null;
          rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      task_stats: {
        Row: {
          user_id: string;
          completed_count: number;
          pending_count: number;
          overdue_count: number;
        };
      };
    };
    Functions: {
      update_updated_at_column: {
        Args: Record<string, never>;
        Returns: unknown;
      };
    };
    Enums: {
      [key: string]: never;
    };
    CompositeTypes: {
      [key: string]: never;
    };
  };
};
