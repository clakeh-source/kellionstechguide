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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_action_logs: {
        Row: {
          action_type: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          module: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          module: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          module?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_ai_insights: {
        Row: {
          action_payload: Json | null
          created_at: string | null
          description: string | null
          dismissed_at: string | null
          dismissed_by: string | null
          entity_id: string | null
          id: string
          insight_type: string
          module: string | null
          recommended_action: string | null
          severity: string | null
          status: string | null
          title: string
        }
        Insert: {
          action_payload?: Json | null
          created_at?: string | null
          description?: string | null
          dismissed_at?: string | null
          dismissed_by?: string | null
          entity_id?: string | null
          id?: string
          insight_type: string
          module?: string | null
          recommended_action?: string | null
          severity?: string | null
          status?: string | null
          title: string
        }
        Update: {
          action_payload?: Json | null
          created_at?: string | null
          description?: string | null
          dismissed_at?: string | null
          dismissed_by?: string | null
          entity_id?: string | null
          id?: string
          insight_type?: string
          module?: string | null
          recommended_action?: string | null
          severity?: string | null
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      admin_automation_runs: {
        Row: {
          automation_id: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          result: Json | null
          started_at: string
          status: string
          triggered_by: string | null
        }
        Insert: {
          automation_id: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          result?: Json | null
          started_at?: string
          status?: string
          triggered_by?: string | null
        }
        Update: {
          automation_id?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          result?: Json | null
          started_at?: string
          status?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_automation_runs_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "admin_automations"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_automations: {
        Row: {
          action_config: Json | null
          action_type: string
          admin_id: string
          created_at: string
          description: string | null
          id: string
          is_enabled: boolean
          last_run_at: string | null
          name: string
          run_count: number | null
          schedule_cron: string | null
          template_type: string
          trigger_config: Json | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          action_config?: Json | null
          action_type?: string
          admin_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          last_run_at?: string | null
          name: string
          run_count?: number | null
          schedule_cron?: string | null
          template_type?: string
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
        }
        Update: {
          action_config?: Json | null
          action_type?: string
          admin_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          last_run_at?: string | null
          name?: string
          run_count?: number | null
          schedule_cron?: string | null
          template_type?: string
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      anm_baselines: {
        Row: {
          baseline_mean: number
          baseline_stddev: number
          created_at: string | null
          day_of_week: number | null
          device_id: string
          hour_of_day: number | null
          id: string
          interface_id: string | null
          last_updated_at: string | null
          metric_type: string
          org_id: string
          sample_count: number | null
        }
        Insert: {
          baseline_mean: number
          baseline_stddev: number
          created_at?: string | null
          day_of_week?: number | null
          device_id: string
          hour_of_day?: number | null
          id?: string
          interface_id?: string | null
          last_updated_at?: string | null
          metric_type: string
          org_id?: string
          sample_count?: number | null
        }
        Update: {
          baseline_mean?: number
          baseline_stddev?: number
          created_at?: string | null
          day_of_week?: number | null
          device_id?: string
          hour_of_day?: number | null
          id?: string
          interface_id?: string | null
          last_updated_at?: string | null
          metric_type?: string
          org_id?: string
          sample_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "anm_baselines_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "anm_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anm_baselines_interface_id_fkey"
            columns: ["interface_id"]
            isOneToOne: false
            referencedRelation: "anm_interfaces"
            referencedColumns: ["id"]
          },
        ]
      }
      anm_device_metrics: {
        Row: {
          device_id: string
          id: string
          interface_id: string | null
          metric_type: string
          org_id: string
          recorded_at: string | null
          unit: string | null
          value: number
        }
        Insert: {
          device_id: string
          id?: string
          interface_id?: string | null
          metric_type: string
          org_id?: string
          recorded_at?: string | null
          unit?: string | null
          value: number
        }
        Update: {
          device_id?: string
          id?: string
          interface_id?: string | null
          metric_type?: string
          org_id?: string
          recorded_at?: string | null
          unit?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "anm_device_metrics_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "anm_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anm_device_metrics_interface_id_fkey"
            columns: ["interface_id"]
            isOneToOne: false
            referencedRelation: "anm_interfaces"
            referencedColumns: ["id"]
          },
        ]
      }
      anm_devices: {
        Row: {
          created_at: string | null
          criticality: string | null
          dependencies: string[] | null
          device_type: string
          discovery_method: string | null
          health_score: number | null
          hostname: string
          id: string
          ip_address: unknown
          last_polled_at: string | null
          location: string | null
          mac_address: string | null
          metadata: Json | null
          model: string | null
          org_id: string
          os_version: string | null
          snmp_community: string | null
          snmp_version: string | null
          status: string | null
          updated_at: string | null
          vendor: string | null
        }
        Insert: {
          created_at?: string | null
          criticality?: string | null
          dependencies?: string[] | null
          device_type?: string
          discovery_method?: string | null
          health_score?: number | null
          hostname: string
          id?: string
          ip_address?: unknown
          last_polled_at?: string | null
          location?: string | null
          mac_address?: string | null
          metadata?: Json | null
          model?: string | null
          org_id?: string
          os_version?: string | null
          snmp_community?: string | null
          snmp_version?: string | null
          status?: string | null
          updated_at?: string | null
          vendor?: string | null
        }
        Update: {
          created_at?: string | null
          criticality?: string | null
          dependencies?: string[] | null
          device_type?: string
          discovery_method?: string | null
          health_score?: number | null
          hostname?: string
          id?: string
          ip_address?: unknown
          last_polled_at?: string | null
          location?: string | null
          mac_address?: string | null
          metadata?: Json | null
          model?: string | null
          org_id?: string
          os_version?: string | null
          snmp_community?: string | null
          snmp_version?: string | null
          status?: string | null
          updated_at?: string | null
          vendor?: string | null
        }
        Relationships: []
      }
      anm_insights: {
        Row: {
          acknowledged_by: string | null
          affected_devices: string[] | null
          affected_services: string[] | null
          affected_users_estimate: number | null
          confidence: number
          created_at: string | null
          evidence_json: Json | null
          explanation: string
          first_detected_at: string | null
          id: string
          impact_assessment: string | null
          insight_type: string
          last_updated_at: string | null
          org_id: string
          recommended_actions: Json | null
          resolution_notes: string | null
          resolved_at: string | null
          root_cause: string | null
          severity: string
          status: string | null
          timeline_json: Json | null
          title: string
        }
        Insert: {
          acknowledged_by?: string | null
          affected_devices?: string[] | null
          affected_services?: string[] | null
          affected_users_estimate?: number | null
          confidence?: number
          created_at?: string | null
          evidence_json?: Json | null
          explanation: string
          first_detected_at?: string | null
          id?: string
          impact_assessment?: string | null
          insight_type: string
          last_updated_at?: string | null
          org_id?: string
          recommended_actions?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: string
          status?: string | null
          timeline_json?: Json | null
          title: string
        }
        Update: {
          acknowledged_by?: string | null
          affected_devices?: string[] | null
          affected_services?: string[] | null
          affected_users_estimate?: number | null
          confidence?: number
          created_at?: string | null
          evidence_json?: Json | null
          explanation?: string
          first_detected_at?: string | null
          id?: string
          impact_assessment?: string | null
          insight_type?: string
          last_updated_at?: string | null
          org_id?: string
          recommended_actions?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: string
          status?: string | null
          timeline_json?: Json | null
          title?: string
        }
        Relationships: []
      }
      anm_interfaces: {
        Row: {
          created_at: string | null
          description: string | null
          device_id: string
          id: string
          if_index: number | null
          ip_address: unknown
          mac_address: string | null
          name: string
          org_id: string
          speed_mbps: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          device_id: string
          id?: string
          if_index?: number | null
          ip_address?: unknown
          mac_address?: string | null
          name: string
          org_id?: string
          speed_mbps?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          device_id?: string
          id?: string
          if_index?: number | null
          ip_address?: unknown
          mac_address?: string | null
          name?: string
          org_id?: string
          speed_mbps?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anm_interfaces_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "anm_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      anm_predictions: {
        Row: {
          confidence: number
          confidence_label: string | null
          created_at: string | null
          current_trend: string | null
          days_until_impact: number | null
          device_id: string | null
          explanation: string
          id: string
          org_id: string
          predicted_date: string | null
          prediction_type: string
          recommended_action: string | null
          risk_level: string | null
          status: string | null
          trend_data_json: Json | null
        }
        Insert: {
          confidence: number
          confidence_label?: string | null
          created_at?: string | null
          current_trend?: string | null
          days_until_impact?: number | null
          device_id?: string | null
          explanation: string
          id?: string
          org_id?: string
          predicted_date?: string | null
          prediction_type: string
          recommended_action?: string | null
          risk_level?: string | null
          status?: string | null
          trend_data_json?: Json | null
        }
        Update: {
          confidence?: number
          confidence_label?: string | null
          created_at?: string | null
          current_trend?: string | null
          days_until_impact?: number | null
          device_id?: string | null
          explanation?: string
          id?: string
          org_id?: string
          predicted_date?: string | null
          prediction_type?: string
          recommended_action?: string | null
          risk_level?: string | null
          status?: string | null
          trend_data_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "anm_predictions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "anm_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      anm_sla_definitions: {
        Row: {
          applies_to_device_types: string[] | null
          applies_to_devices: string[] | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_latency_ms: number | null
          max_packet_loss_percent: number | null
          measurement_window_hours: number | null
          name: string
          org_id: string
          target_uptime_percent: number | null
          updated_at: string | null
        }
        Insert: {
          applies_to_device_types?: string[] | null
          applies_to_devices?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_latency_ms?: number | null
          max_packet_loss_percent?: number | null
          measurement_window_hours?: number | null
          name: string
          org_id?: string
          target_uptime_percent?: number | null
          updated_at?: string | null
        }
        Update: {
          applies_to_device_types?: string[] | null
          applies_to_devices?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_latency_ms?: number | null
          max_packet_loss_percent?: number | null
          measurement_window_hours?: number | null
          name?: string
          org_id?: string
          target_uptime_percent?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      anm_sla_violations: {
        Row: {
          actual_value: number
          created_at: string | null
          device_id: string | null
          duration_minutes: number | null
          ended_at: string | null
          id: string
          impact_description: string | null
          org_id: string
          sla_id: string
          started_at: string
          threshold_value: number
          violation_type: string
        }
        Insert: {
          actual_value: number
          created_at?: string | null
          device_id?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          impact_description?: string | null
          org_id?: string
          sla_id: string
          started_at: string
          threshold_value: number
          violation_type: string
        }
        Update: {
          actual_value?: number
          created_at?: string | null
          device_id?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          impact_description?: string | null
          org_id?: string
          sla_id?: string
          started_at?: string
          threshold_value?: number
          violation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "anm_sla_violations_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "anm_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anm_sla_violations_sla_id_fkey"
            columns: ["sla_id"]
            isOneToOne: false
            referencedRelation: "anm_sla_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      anm_topology_links: {
        Row: {
          bandwidth_mbps: number | null
          created_at: string | null
          id: string
          last_verified_at: string | null
          link_type: string | null
          org_id: string
          source_device_id: string
          source_interface_id: string | null
          status: string | null
          target_device_id: string
          target_interface_id: string | null
        }
        Insert: {
          bandwidth_mbps?: number | null
          created_at?: string | null
          id?: string
          last_verified_at?: string | null
          link_type?: string | null
          org_id?: string
          source_device_id: string
          source_interface_id?: string | null
          status?: string | null
          target_device_id: string
          target_interface_id?: string | null
        }
        Update: {
          bandwidth_mbps?: number | null
          created_at?: string | null
          id?: string
          last_verified_at?: string | null
          link_type?: string | null
          org_id?: string
          source_device_id?: string
          source_interface_id?: string | null
          status?: string | null
          target_device_id?: string
          target_interface_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anm_topology_links_source_device_id_fkey"
            columns: ["source_device_id"]
            isOneToOne: false
            referencedRelation: "anm_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anm_topology_links_source_interface_id_fkey"
            columns: ["source_interface_id"]
            isOneToOne: false
            referencedRelation: "anm_interfaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anm_topology_links_target_device_id_fkey"
            columns: ["target_device_id"]
            isOneToOne: false
            referencedRelation: "anm_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anm_topology_links_target_interface_id_fkey"
            columns: ["target_interface_id"]
            isOneToOne: false
            referencedRelation: "anm_interfaces"
            referencedColumns: ["id"]
          },
        ]
      }
      atlas_access_group_members: {
        Row: {
          added_at: string
          group_id: string
          id: string
          org_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          group_id: string
          id?: string
          org_id?: string
          user_id: string
        }
        Update: {
          added_at?: string
          group_id?: string
          id?: string
          org_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "atlas_access_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "atlas_access_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      atlas_access_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          org_id: string
          permissions: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          org_id?: string
          permissions?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          org_id?: string
          permissions?: Json
          updated_at?: string
        }
        Relationships: []
      }
      atlas_assets: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          ip_address: string | null
          last_seen_at: string | null
          location: string | null
          mac_address: string | null
          manufacturer: string | null
          metadata: Json | null
          model: string | null
          name: string
          org_id: string
          purchase_date: string | null
          serial_number: string | null
          status: string
          type: string
          updated_at: string
          warranty_expiry: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          last_seen_at?: string | null
          location?: string | null
          mac_address?: string | null
          manufacturer?: string | null
          metadata?: Json | null
          model?: string | null
          name: string
          org_id?: string
          purchase_date?: string | null
          serial_number?: string | null
          status?: string
          type?: string
          updated_at?: string
          warranty_expiry?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          last_seen_at?: string | null
          location?: string | null
          mac_address?: string | null
          manufacturer?: string | null
          metadata?: Json | null
          model?: string | null
          name?: string
          org_id?: string
          purchase_date?: string | null
          serial_number?: string | null
          status?: string
          type?: string
          updated_at?: string
          warranty_expiry?: string | null
        }
        Relationships: []
      }
      atlas_licenses: {
        Row: {
          category: string | null
          cost_per_seat: number | null
          created_at: string
          expires_at: string | null
          id: string
          license_key: string | null
          name: string
          notes: string | null
          org_id: string
          seats_total: number | null
          seats_used: number | null
          updated_at: string
          vendor: string | null
        }
        Insert: {
          category?: string | null
          cost_per_seat?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          license_key?: string | null
          name: string
          notes?: string | null
          org_id?: string
          seats_total?: number | null
          seats_used?: number | null
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          category?: string | null
          cost_per_seat?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          license_key?: string | null
          name?: string
          notes?: string | null
          org_id?: string
          seats_total?: number | null
          seats_used?: number | null
          updated_at?: string
          vendor?: string | null
        }
        Relationships: []
      }
      atlas_ticket_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_ai: boolean | null
          ticket_id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_ai?: boolean | null
          ticket_id: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_ai?: boolean | null
          ticket_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atlas_ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "atlas_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      atlas_tickets: {
        Row: {
          ai_analysis: Json | null
          ai_classification: Json | null
          assigned_to: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          org_id: string
          priority: string | null
          resolution_notes: string | null
          resolved_at: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          ai_classification?: Json | null
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          org_id?: string
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          ai_classification?: Json | null
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          org_id?: string
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ccna_cli_sessions: {
        Row: {
          commands_executed: Json
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          scenario_id: string
          score: number | null
          started_at: string
          user_id: string
        }
        Insert: {
          commands_executed?: Json
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          scenario_id: string
          score?: number | null
          started_at?: string
          user_id: string
        }
        Update: {
          commands_executed?: Json
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          scenario_id?: string
          score?: number | null
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ccna_flashcard_progress: {
        Row: {
          card_id: string
          created_at: string
          ease_factor: number
          id: string
          interval_days: number
          last_reviewed_at: string | null
          next_review_at: string
          repetitions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          next_review_at?: string
          repetitions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          card_id?: string
          created_at?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          next_review_at?: string
          repetitions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ccna_quiz_attempts: {
        Row: {
          created_at: string
          domain_id: string | null
          id: string
          passed: boolean | null
          questions_json: Json | null
          quiz_type: string
          score: number
          time_taken_seconds: number | null
          topic_id: string | null
          total_questions: number
          user_id: string
          weak_areas: Json | null
        }
        Insert: {
          created_at?: string
          domain_id?: string | null
          id?: string
          passed?: boolean | null
          questions_json?: Json | null
          quiz_type: string
          score: number
          time_taken_seconds?: number | null
          topic_id?: string | null
          total_questions: number
          user_id: string
          weak_areas?: Json | null
        }
        Update: {
          created_at?: string
          domain_id?: string | null
          id?: string
          passed?: boolean | null
          questions_json?: Json | null
          quiz_type?: string
          score?: number
          time_taken_seconds?: number | null
          topic_id?: string | null
          total_questions?: number
          user_id?: string
          weak_areas?: Json | null
        }
        Relationships: []
      }
      ccna_study_streaks: {
        Row: {
          current_streak: number | null
          id: string
          last_study_date: string | null
          longest_streak: number | null
          total_study_days: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number | null
          id?: string
          last_study_date?: string | null
          longest_streak?: number | null
          total_study_days?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number | null
          id?: string
          last_study_date?: string | null
          longest_streak?: number | null
          total_study_days?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ccna_user_progress: {
        Row: {
          attempts: number | null
          completed: boolean | null
          completed_at: string | null
          created_at: string
          domain_id: string
          id: string
          last_accessed_at: string | null
          lesson_id: string | null
          score: number | null
          time_spent_seconds: number | null
          topic_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          domain_id: string
          id?: string
          last_accessed_at?: string | null
          lesson_id?: string | null
          score?: number | null
          time_spent_seconds?: number | null
          topic_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          domain_id?: string
          id?: string
          last_accessed_at?: string | null
          lesson_id?: string | null
          score?: number | null
          time_spent_seconds?: number | null
          topic_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_items: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_published: boolean | null
          slug: string
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      maintenance_tasks: {
        Row: {
          admin_id: string
          completed_at: string | null
          created_at: string
          id: string
          result: Json | null
          started_at: string | null
          status: string
          task_type: string
        }
        Insert: {
          admin_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          result?: Json | null
          started_at?: string | null
          status?: string
          task_type: string
        }
        Update: {
          admin_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          result?: Json | null
          started_at?: string | null
          status?: string
          task_type?: string
        }
        Relationships: []
      }
      nid_arp_entries: {
        Row: {
          device_id: string
          discovered_at: string | null
          id: string
          interface_name: string | null
          ip_address: unknown
          mac_address: string | null
        }
        Insert: {
          device_id: string
          discovered_at?: string | null
          id?: string
          interface_name?: string | null
          ip_address?: unknown
          mac_address?: string | null
        }
        Update: {
          device_id?: string
          discovered_at?: string | null
          id?: string
          interface_name?: string | null
          ip_address?: unknown
          mac_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nid_arp_entries_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "nid_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      nid_collectors: {
        Row: {
          capture_mode: string
          created_at: string
          id: string
          interface_name: string | null
          last_heartbeat: string | null
          name: string
          network_id: string
          status: string
          token_hash: string
          version: string | null
        }
        Insert: {
          capture_mode?: string
          created_at?: string
          id?: string
          interface_name?: string | null
          last_heartbeat?: string | null
          name?: string
          network_id: string
          status?: string
          token_hash: string
          version?: string | null
        }
        Update: {
          capture_mode?: string
          created_at?: string
          id?: string
          interface_name?: string | null
          last_heartbeat?: string | null
          name?: string
          network_id?: string
          status?: string
          token_hash?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nid_collectors_network_id_fkey"
            columns: ["network_id"]
            isOneToOne: false
            referencedRelation: "nid_networks"
            referencedColumns: ["id"]
          },
        ]
      }
      nid_device_interfaces: {
        Row: {
          description: string | null
          device_id: string
          discovered_at: string | null
          id: string
          if_index: number | null
          ip_address: unknown
          mac_address: string | null
          mtu: number | null
          name: string | null
          speed_mbps: number | null
          status: string | null
          subnet_mask: unknown
          vlan_id: number | null
        }
        Insert: {
          description?: string | null
          device_id: string
          discovered_at?: string | null
          id?: string
          if_index?: number | null
          ip_address?: unknown
          mac_address?: string | null
          mtu?: number | null
          name?: string | null
          speed_mbps?: number | null
          status?: string | null
          subnet_mask?: unknown
          vlan_id?: number | null
        }
        Update: {
          description?: string | null
          device_id?: string
          discovered_at?: string | null
          id?: string
          if_index?: number | null
          ip_address?: unknown
          mac_address?: string | null
          mtu?: number | null
          name?: string | null
          speed_mbps?: number | null
          status?: string | null
          subnet_mask?: unknown
          vlan_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nid_device_interfaces_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "nid_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      nid_devices: {
        Row: {
          device_type: string
          first_seen: string
          hostname: string | null
          id: string
          ip_address: string | null
          label: string | null
          last_seen: string
          mac_address: string | null
          metadata: Json | null
          network_id: string
          os_guess: string | null
          trust_level: string
          vendor: string | null
        }
        Insert: {
          device_type?: string
          first_seen?: string
          hostname?: string | null
          id?: string
          ip_address?: string | null
          label?: string | null
          last_seen?: string
          mac_address?: string | null
          metadata?: Json | null
          network_id: string
          os_guess?: string | null
          trust_level?: string
          vendor?: string | null
        }
        Update: {
          device_type?: string
          first_seen?: string
          hostname?: string | null
          id?: string
          ip_address?: string | null
          label?: string | null
          last_seen?: string
          mac_address?: string | null
          metadata?: Json | null
          network_id?: string
          os_guess?: string | null
          trust_level?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nid_devices_network_id_fkey"
            columns: ["network_id"]
            isOneToOne: false
            referencedRelation: "nid_networks"
            referencedColumns: ["id"]
          },
        ]
      }
      nid_network_paths: {
        Row: {
          discovered_at: string | null
          hops: Json
          id: string
          last_verified: string | null
          network_id: string
          path_cost: number | null
          path_type: string
          source_device_id: string
          status: string | null
          target_device_id: string
          total_latency_ms: number | null
        }
        Insert: {
          discovered_at?: string | null
          hops?: Json
          id?: string
          last_verified?: string | null
          network_id: string
          path_cost?: number | null
          path_type: string
          source_device_id: string
          status?: string | null
          target_device_id: string
          total_latency_ms?: number | null
        }
        Update: {
          discovered_at?: string | null
          hops?: Json
          id?: string
          last_verified?: string | null
          network_id?: string
          path_cost?: number | null
          path_type?: string
          source_device_id?: string
          status?: string | null
          target_device_id?: string
          total_latency_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nid_network_paths_network_id_fkey"
            columns: ["network_id"]
            isOneToOne: false
            referencedRelation: "nid_networks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nid_network_paths_source_device_id_fkey"
            columns: ["source_device_id"]
            isOneToOne: false
            referencedRelation: "nid_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nid_network_paths_target_device_id_fkey"
            columns: ["target_device_id"]
            isOneToOne: false
            referencedRelation: "nid_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      nid_networks: {
        Row: {
          cidr_range: string | null
          collector_last_seen: string | null
          created_at: string
          description: string | null
          id: string
          location_label: string | null
          monitor_interval_seconds: number | null
          name: string
          workspace_id: string
        }
        Insert: {
          cidr_range?: string | null
          collector_last_seen?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location_label?: string | null
          monitor_interval_seconds?: number | null
          name: string
          workspace_id: string
        }
        Update: {
          cidr_range?: string | null
          collector_last_seen?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location_label?: string | null
          monitor_interval_seconds?: number | null
          name?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nid_networks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "nid_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      nid_ping_tests: {
        Row: {
          avg_ms: number | null
          created_at: string
          device_id: string | null
          id: string
          jitter_ms: number | null
          network_id: string
          packet_loss_pct: number | null
          raw_json: Json | null
          target: string
        }
        Insert: {
          avg_ms?: number | null
          created_at?: string
          device_id?: string | null
          id?: string
          jitter_ms?: number | null
          network_id: string
          packet_loss_pct?: number | null
          raw_json?: Json | null
          target: string
        }
        Update: {
          avg_ms?: number | null
          created_at?: string
          device_id?: string | null
          id?: string
          jitter_ms?: number | null
          network_id?: string
          packet_loss_pct?: number | null
          raw_json?: Json | null
          target?: string
        }
        Relationships: [
          {
            foreignKeyName: "nid_ping_tests_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "nid_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nid_ping_tests_network_id_fkey"
            columns: ["network_id"]
            isOneToOne: false
            referencedRelation: "nid_networks"
            referencedColumns: ["id"]
          },
        ]
      }
      nid_routing_entries: {
        Row: {
          dest_network: unknown
          device_id: string
          discovered_at: string | null
          id: string
          interface_name: string | null
          metric: number | null
          next_hop: unknown
          protocol: string | null
          route_type: string | null
        }
        Insert: {
          dest_network?: unknown
          device_id: string
          discovered_at?: string | null
          id?: string
          interface_name?: string | null
          metric?: number | null
          next_hop?: unknown
          protocol?: string | null
          route_type?: string | null
        }
        Update: {
          dest_network?: unknown
          device_id?: string
          discovered_at?: string | null
          id?: string
          interface_name?: string | null
          metric?: number | null
          next_hop?: unknown
          protocol?: string | null
          route_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nid_routing_entries_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "nid_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      nid_security_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string | null
          device_id: string | null
          evidence_json: Json | null
          id: string
          network_id: string
          resolved: boolean
          severity: string
          title: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          description?: string | null
          device_id?: string | null
          evidence_json?: Json | null
          id?: string
          network_id: string
          resolved?: boolean
          severity?: string
          title: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string | null
          device_id?: string | null
          evidence_json?: Json | null
          id?: string
          network_id?: string
          resolved?: boolean
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "nid_security_alerts_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "nid_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nid_security_alerts_network_id_fkey"
            columns: ["network_id"]
            isOneToOne: false
            referencedRelation: "nid_networks"
            referencedColumns: ["id"]
          },
        ]
      }
      nid_snmp_discovery: {
        Row: {
          completed_at: string | null
          created_by: string | null
          devices_found: number | null
          error_message: string | null
          id: string
          network_id: string
          results_json: Json | null
          scan_type: string
          started_at: string | null
          status: string
          target_range: string
        }
        Insert: {
          completed_at?: string | null
          created_by?: string | null
          devices_found?: number | null
          error_message?: string | null
          id?: string
          network_id: string
          results_json?: Json | null
          scan_type?: string
          started_at?: string | null
          status?: string
          target_range: string
        }
        Update: {
          completed_at?: string | null
          created_by?: string | null
          devices_found?: number | null
          error_message?: string | null
          id?: string
          network_id?: string
          results_json?: Json | null
          scan_type?: string
          started_at?: string | null
          status?: string
          target_range?: string
        }
        Relationships: [
          {
            foreignKeyName: "nid_snmp_discovery_network_id_fkey"
            columns: ["network_id"]
            isOneToOne: false
            referencedRelation: "nid_networks"
            referencedColumns: ["id"]
          },
        ]
      }
      nid_traffic_flows: {
        Row: {
          bytes: number
          created_at: string
          device_id: string | null
          direction: string
          dst_domain: string | null
          dst_ip: string | null
          dst_port: number | null
          first_seen: string
          id: string
          last_seen: string
          network_id: string
          packets: number
          protocol: string | null
          src_ip: string | null
        }
        Insert: {
          bytes?: number
          created_at?: string
          device_id?: string | null
          direction?: string
          dst_domain?: string | null
          dst_ip?: string | null
          dst_port?: number | null
          first_seen?: string
          id?: string
          last_seen?: string
          network_id: string
          packets?: number
          protocol?: string | null
          src_ip?: string | null
        }
        Update: {
          bytes?: number
          created_at?: string
          device_id?: string | null
          direction?: string
          dst_domain?: string | null
          dst_ip?: string | null
          dst_port?: number | null
          first_seen?: string
          id?: string
          last_seen?: string
          network_id?: string
          packets?: number
          protocol?: string | null
          src_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nid_traffic_flows_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "nid_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nid_traffic_flows_network_id_fkey"
            columns: ["network_id"]
            isOneToOne: false
            referencedRelation: "nid_networks"
            referencedColumns: ["id"]
          },
        ]
      }
      nid_traffic_samples: {
        Row: {
          active_devices: number
          created_at: string
          download_bytes: number
          id: string
          network_id: string
          ts_bucket: string
          upload_bytes: number
        }
        Insert: {
          active_devices?: number
          created_at?: string
          download_bytes?: number
          id?: string
          network_id: string
          ts_bucket: string
          upload_bytes?: number
        }
        Update: {
          active_devices?: number
          created_at?: string
          download_bytes?: number
          id?: string
          network_id?: string
          ts_bucket?: string
          upload_bytes?: number
        }
        Relationships: [
          {
            foreignKeyName: "nid_traffic_samples_network_id_fkey"
            columns: ["network_id"]
            isOneToOne: false
            referencedRelation: "nid_networks"
            referencedColumns: ["id"]
          },
        ]
      }
      nid_workspace_members: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nid_workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "nid_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      nid_workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_user_id?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          browser: string | null
          country: string | null
          created_at: string
          device_type: string | null
          id: string
          path: string
          referrer: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          path: string
          referrer?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          path?: string
          referrer?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_blocked: boolean | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_blocked?: boolean | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_blocked?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scan_history: {
        Row: {
          created_at: string
          exposure: Json
          id: string
          ip_detection: Json | null
          results: Json
          scan_type: string
          stealth: Json | null
          summary: Json
          target: string
          target_type: string
          tls_results: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          exposure: Json
          id?: string
          ip_detection?: Json | null
          results: Json
          scan_type: string
          stealth?: Json | null
          summary: Json
          target: string
          target_type: string
          tls_results?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          exposure?: Json
          id?: string
          ip_detection?: Json | null
          results?: Json
          scan_type?: string
          stealth?: Json | null
          summary?: Json
          target?: string
          target_type?: string
          tls_results?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      site_health_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_type: string
          recorded_at: string | null
          value: number
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_type: string
          recorded_at?: string | null
          value: number
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_type?: string
          recorded_at?: string | null
          value?: number
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      snm_agent_heartbeats: {
        Row: {
          agent_uptime_seconds: number | null
          cpu_percent: number | null
          created_at: string
          events_processed: number | null
          id: string
          latency_ms: number | null
          memory_percent: number | null
          node_id: string
          org_id: string
          queue_depth: number | null
        }
        Insert: {
          agent_uptime_seconds?: number | null
          cpu_percent?: number | null
          created_at?: string
          events_processed?: number | null
          id?: string
          latency_ms?: number | null
          memory_percent?: number | null
          node_id: string
          org_id: string
          queue_depth?: number | null
        }
        Update: {
          agent_uptime_seconds?: number | null
          cpu_percent?: number | null
          created_at?: string
          events_processed?: number | null
          id?: string
          latency_ms?: number | null
          memory_percent?: number | null
          node_id?: string
          org_id?: string
          queue_depth?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "snm_agent_heartbeats_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "snm_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      snm_alerts: {
        Row: {
          cluster_id: string | null
          confidence: number | null
          cooldown_until: string | null
          count: number | null
          created_at: string
          evidence_json: Json | null
          first_seen_at: string
          id: string
          incident_id: string | null
          last_seen_at: string
          nodes_impacted: string[] | null
          org_id: string
          primary_fingerprint: string
          severity: string
          status: string
          summary: string | null
          title: string
          type: string
        }
        Insert: {
          cluster_id?: string | null
          confidence?: number | null
          cooldown_until?: string | null
          count?: number | null
          created_at?: string
          evidence_json?: Json | null
          first_seen_at?: string
          id?: string
          incident_id?: string | null
          last_seen_at?: string
          nodes_impacted?: string[] | null
          org_id: string
          primary_fingerprint: string
          severity?: string
          status?: string
          summary?: string | null
          title: string
          type: string
        }
        Update: {
          cluster_id?: string | null
          confidence?: number | null
          cooldown_until?: string | null
          count?: number | null
          created_at?: string
          evidence_json?: Json | null
          first_seen_at?: string
          id?: string
          incident_id?: string | null
          last_seen_at?: string
          nodes_impacted?: string[] | null
          org_id?: string
          primary_fingerprint?: string
          severity?: string
          status?: string
          summary?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "snm_alerts_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "snm_dedup_clusters"
            referencedColumns: ["id"]
          },
        ]
      }
      snm_dedup_clusters: {
        Row: {
          cluster_key: string
          fingerprints: string[] | null
          first_seen_at: string
          id: string
          last_seen_at: string
          merged_count: number | null
          org_id: string
          similarity_score: number | null
        }
        Insert: {
          cluster_key: string
          fingerprints?: string[] | null
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          merged_count?: number | null
          org_id: string
          similarity_score?: number | null
        }
        Update: {
          cluster_key?: string
          fingerprints?: string[] | null
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          merged_count?: number | null
          org_id?: string
          similarity_score?: number | null
        }
        Relationships: []
      }
      snm_eval_runs: {
        Row: {
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          event_rate: number | null
          id: string
          mode: string
          node_count: number | null
          org_id: string
          results_json: Json | null
          scenario_name: string
          started_at: string
          status: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          event_rate?: number | null
          id?: string
          mode?: string
          node_count?: number | null
          org_id: string
          results_json?: Json | null
          scenario_name: string
          started_at?: string
          status?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          event_rate?: number | null
          id?: string
          mode?: string
          node_count?: number | null
          org_id?: string
          results_json?: Json | null
          scenario_name?: string
          started_at?: string
          status?: string | null
        }
        Relationships: []
      }
      snm_incident_links: {
        Row: {
          alert_id: string | null
          created_at: string
          event_id: string | null
          id: string
          incident_id: string
          node_id: string | null
          org_id: string
          relationship: string
        }
        Insert: {
          alert_id?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          incident_id: string
          node_id?: string | null
          org_id: string
          relationship?: string
        }
        Update: {
          alert_id?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          incident_id?: string
          node_id?: string | null
          org_id?: string
          relationship?: string
        }
        Relationships: [
          {
            foreignKeyName: "snm_incident_links_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "snm_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "snm_incident_links_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "snm_insight_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "snm_incident_links_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "snm_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "snm_incident_links_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "snm_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      snm_incidents: {
        Row: {
          assigned_to: string | null
          confidence: number | null
          created_at: string
          created_by: string | null
          evidence_chain: Json | null
          first_seen_at: string
          id: string
          last_seen_at: string
          narrative: string | null
          org_id: string
          resolution_notes: string | null
          resolved_at: string | null
          scope_json: Json | null
          severity: string
          status: string
          suggested_actions: Json | null
          tactics_json: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          confidence?: number | null
          created_at?: string
          created_by?: string | null
          evidence_chain?: Json | null
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          narrative?: string | null
          org_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          scope_json?: Json | null
          severity?: string
          status?: string
          suggested_actions?: Json | null
          tactics_json?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          confidence?: number | null
          created_at?: string
          created_by?: string | null
          evidence_chain?: Json | null
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          narrative?: string | null
          org_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          scope_json?: Json | null
          severity?: string
          status?: string
          suggested_actions?: Json | null
          tactics_json?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      snm_insight_events: {
        Row: {
          confidence: number | null
          dst_ip: string | null
          dst_port: number | null
          event_id: string
          explanation: string | null
          features_json: Json
          fingerprint: string
          id: string
          node_id: string
          occurred_at: string
          org_id: string
          processed: boolean | null
          protocol: string | null
          received_at: string
          severity: string
          src_ip: string | null
          src_port: number | null
          type: string
        }
        Insert: {
          confidence?: number | null
          dst_ip?: string | null
          dst_port?: number | null
          event_id: string
          explanation?: string | null
          features_json?: Json
          fingerprint: string
          id?: string
          node_id: string
          occurred_at: string
          org_id: string
          processed?: boolean | null
          protocol?: string | null
          received_at?: string
          severity?: string
          src_ip?: string | null
          src_port?: number | null
          type: string
        }
        Update: {
          confidence?: number | null
          dst_ip?: string | null
          dst_port?: number | null
          event_id?: string
          explanation?: string | null
          features_json?: Json
          fingerprint?: string
          id?: string
          node_id?: string
          occurred_at?: string
          org_id?: string
          processed?: boolean | null
          protocol?: string | null
          received_at?: string
          severity?: string
          src_ip?: string | null
          src_port?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "snm_insight_events_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "snm_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      snm_metrics_timeseries: {
        Row: {
          dimensions_json: Json | null
          id: string
          metric_name: string
          org_id: string
          ts: string
          value: number
        }
        Insert: {
          dimensions_json?: Json | null
          id?: string
          metric_name: string
          org_id: string
          ts?: string
          value: number
        }
        Update: {
          dimensions_json?: Json | null
          id?: string
          metric_name?: string
          org_id?: string
          ts?: string
          value?: number
        }
        Relationships: []
      }
      snm_node_baselines: {
        Row: {
          baseline_json: Json
          baseline_type: string
          created_at: string
          id: string
          node_id: string
          org_id: string
          sample_count: number | null
          updated_at: string
        }
        Insert: {
          baseline_json?: Json
          baseline_type?: string
          created_at?: string
          id?: string
          node_id: string
          org_id: string
          sample_count?: number | null
          updated_at?: string
        }
        Update: {
          baseline_json?: Json
          baseline_type?: string
          created_at?: string
          id?: string
          node_id?: string
          org_id?: string
          sample_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "snm_node_baselines_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "snm_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      snm_nodes: {
        Row: {
          agent_version: string | null
          created_at: string
          criticality: string | null
          id: string
          ip_address: string | null
          last_seen_at: string | null
          mac_address: string | null
          metadata: Json | null
          name: string
          org_id: string
          os: string | null
          role: string
          site: string | null
          status: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          agent_version?: string | null
          created_at?: string
          criticality?: string | null
          id?: string
          ip_address?: string | null
          last_seen_at?: string | null
          mac_address?: string | null
          metadata?: Json | null
          name: string
          org_id?: string
          os?: string | null
          role?: string
          site?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          agent_version?: string | null
          created_at?: string
          criticality?: string | null
          id?: string
          ip_address?: string | null
          last_seen_at?: string | null
          mac_address?: string | null
          metadata?: Json | null
          name?: string
          org_id?: string
          os?: string | null
          role?: string
          site?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      snm_policies: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean | null
          id: string
          name: string
          org_id: string
          policy_json: Json
          policy_type: string
          priority: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          org_id: string
          policy_json?: Json
          policy_type?: string
          priority?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          org_id?: string
          policy_json?: Json
          policy_type?: string
          priority?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      snm_remote_actions: {
        Row: {
          action_type: string
          approved_by: string | null
          completed_at: string | null
          created_at: string
          id: string
          node_id: string
          org_id: string
          params_json: Json | null
          requested_by: string
          requires_approval: boolean | null
          result_json: Json | null
          rollback_json: Json | null
          status: string | null
        }
        Insert: {
          action_type: string
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          node_id: string
          org_id: string
          params_json?: Json | null
          requested_by: string
          requires_approval?: boolean | null
          result_json?: Json | null
          rollback_json?: Json | null
          status?: string | null
        }
        Update: {
          action_type?: string
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          node_id?: string
          org_id?: string
          params_json?: Json | null
          requested_by?: string
          requires_approval?: boolean | null
          result_json?: Json | null
          rollback_json?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "snm_remote_actions_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "snm_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      snm_remote_commands: {
        Row: {
          command_type: string
          completed_at: string | null
          executed_at: string
          id: string
          org_id: string
          params_json: Json | null
          result_json: Json | null
          session_id: string
          status: string | null
        }
        Insert: {
          command_type: string
          completed_at?: string | null
          executed_at?: string
          id?: string
          org_id: string
          params_json?: Json | null
          result_json?: Json | null
          session_id: string
          status?: string | null
        }
        Update: {
          command_type?: string
          completed_at?: string | null
          executed_at?: string
          id?: string
          org_id?: string
          params_json?: Json | null
          result_json?: Json | null
          session_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "snm_remote_commands_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "snm_remote_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      snm_remote_sessions: {
        Row: {
          ended_at: string | null
          id: string
          node_id: string
          org_id: string
          purpose: string | null
          session_type: string | null
          started_at: string
          status: string | null
          user_id: string
        }
        Insert: {
          ended_at?: string | null
          id?: string
          node_id: string
          org_id: string
          purpose?: string | null
          session_type?: string | null
          started_at?: string
          status?: string | null
          user_id: string
        }
        Update: {
          ended_at?: string | null
          id?: string
          node_id?: string
          org_id?: string
          purpose?: string | null
          session_type?: string | null
          started_at?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "snm_remote_sessions_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "snm_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      snm_suppressions: {
        Row: {
          created_at: string
          created_by: string | null
          enabled: boolean | null
          ends_at: string | null
          id: string
          match_json: Json
          name: string
          org_id: string
          reason: string | null
          starts_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          enabled?: boolean | null
          ends_at?: string | null
          id?: string
          match_json?: Json
          name: string
          org_id: string
          reason?: string | null
          starts_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          enabled?: boolean | null
          ends_at?: string | null
          id?: string
          match_json?: Json
          name?: string
          org_id?: string
          reason?: string | null
          starts_at?: string
        }
        Relationships: []
      }
      tool_usage: {
        Row: {
          id: string
          tool_id: string
          tool_name: string
          used_at: string
          user_id: string
        }
        Insert: {
          id?: string
          tool_id: string
          tool_name: string
          used_at?: string
          user_id: string
        }
        Update: {
          id?: string
          tool_id?: string
          tool_name?: string
          used_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          tool_id: string
          tool_name: string
          tool_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tool_id: string
          tool_name: string
          tool_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tool_id?: string
          tool_name?: string
          tool_path?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      ccna_leaderboard: {
        Row: {
          avatar_url: string | null
          avg_score: number | null
          cards_mastered: number | null
          cli_scenarios_completed: number | null
          current_streak: number | null
          full_name: string | null
          longest_streak: number | null
          mock_exams_passed: number | null
          total_quizzes: number | null
          total_study_days: number | null
          total_xp: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      nid_has_access: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      nid_has_write_access: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      nid_workspace_for_network: {
        Args: { _network_id: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
