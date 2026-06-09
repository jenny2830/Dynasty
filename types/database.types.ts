export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      landlords: {
        Row: {
          id: string
          auth_user_id: string
          full_name: string
          email: string
          phone: string | null
          country: string
          currency: string
          plan: 'free' | 'starter' | 'landlord' | 'portfolio'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          theme_preference: 'dark-gold' | 'light-gold' | 'dark-rose' | 'light-rose' | 'dark' | 'light'
          last_selected_property_id: string | null
          default_date_range: 'week' | 'month' | 'quarter' | 'year'
          notification_prefs: Json
          onboarding_completed: boolean
          sessions_used: number
          free_trial_started_at: string | null
          free_trial_expired: boolean
          signup_ip: string | null
          signup_fingerprint: string | null
          is_blocked: boolean
        }
        Insert: {
          id?: string
          auth_user_id: string
          full_name: string
          email: string
          phone?: string | null
          country?: string
          currency?: string
          plan?: 'free' | 'starter' | 'landlord' | 'portfolio'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          theme_preference?: 'dark-gold' | 'light-gold' | 'dark-rose' | 'light-rose' | 'dark' | 'light'
          last_selected_property_id?: string | null
          default_date_range?: 'week' | 'month' | 'quarter' | 'year'
          notification_prefs?: Json
          onboarding_completed?: boolean
          sessions_used?: number
          free_trial_started_at?: string | null
          free_trial_expired?: boolean
          signup_ip?: string | null
          signup_fingerprint?: string | null
          is_blocked?: boolean
        }
        Update: {
          id?: string
          auth_user_id?: string
          full_name?: string
          email?: string
          phone?: string | null
          country?: string
          currency?: string
          plan?: 'free' | 'starter' | 'landlord' | 'portfolio'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          theme_preference?: 'dark-gold' | 'light-gold' | 'dark-rose' | 'light-rose' | 'dark' | 'light'
          last_selected_property_id?: string | null
          default_date_range?: 'week' | 'month' | 'quarter' | 'year'
          notification_prefs?: Json
          onboarding_completed?: boolean
          sessions_used?: number
          free_trial_started_at?: string | null
          free_trial_expired?: boolean
          signup_ip?: string | null
          signup_fingerprint?: string | null
          is_blocked?: boolean
        }
        Relationships: []
      }
      signup_audit: {
        Row: {
          id: string
          email: string
          ip_address: string | null
          fingerprint: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          ip_address?: string | null
          fingerprint?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          ip_address?: string | null
          fingerprint?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          id: string
          landlord_id: string
          name: string
          address: string
          city: string
          province: string
          postal_code: string | null
          country: string
          currency: string
          type: 'rental' | 'condo' | 'strata'
          property_subtype: 'residential' | 'commercial'
          num_units: number
          purchase_price: number | null
          current_value: number | null
          mortgage_balance: number | null
          monthly_mortgage: number | null
          condo_fee: number | null
          strata_fee: number | null
          status: 'active' | 'vacant' | 'inactive'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          landlord_id: string
          name: string
          address: string
          city: string
          province: string
          postal_code?: string | null
          country?: string
          currency?: string
          type: 'rental' | 'condo' | 'strata'
          property_subtype: 'residential' | 'commercial'
          num_units?: number
          purchase_price?: number | null
          current_value?: number | null
          mortgage_balance?: number | null
          monthly_mortgage?: number | null
          condo_fee?: number | null
          strata_fee?: number | null
          status?: 'active' | 'vacant' | 'inactive'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          landlord_id?: string
          name?: string
          address?: string
          city?: string
          province?: string
          postal_code?: string | null
          country?: string
          currency?: string
          type?: 'rental' | 'condo' | 'strata'
          property_subtype?: 'residential' | 'commercial'
          num_units?: number
          purchase_price?: number | null
          current_value?: number | null
          mortgage_balance?: number | null
          monthly_mortgage?: number | null
          condo_fee?: number | null
          strata_fee?: number | null
          status?: 'active' | 'vacant' | 'inactive'
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'properties_landlord_id_fkey'
            columns: ['landlord_id']
            isOneToOne: false
            referencedRelation: 'landlords'
            referencedColumns: ['id']
          }
        ]
      }
      units: {
        Row: {
          id: string
          property_id: string
          unit_number: string
          bedrooms: number | null
          bathrooms: number | null
          sqft: number | null
          rent_amount: number | null
          status: 'occupied' | 'vacant' | 'maintenance'
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          unit_number: string
          bedrooms?: number | null
          bathrooms?: number | null
          sqft?: number | null
          rent_amount?: number | null
          status?: 'occupied' | 'vacant' | 'maintenance'
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          unit_number?: string
          bedrooms?: number | null
          bathrooms?: number | null
          sqft?: number | null
          rent_amount?: number | null
          status?: 'occupied' | 'vacant' | 'maintenance'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'units_property_id_fkey'
            columns: ['property_id']
            isOneToOne: false
            referencedRelation: 'properties'
            referencedColumns: ['id']
          }
        ]
      }
      tenants: {
        Row: {
          id: string
          landlord_id: string
          full_name: string
          email: string | null
          phone: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          landlord_id: string
          full_name: string
          email?: string | null
          phone?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          landlord_id?: string
          full_name?: string
          email?: string | null
          phone?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tenants_landlord_id_fkey'
            columns: ['landlord_id']
            isOneToOne: false
            referencedRelation: 'landlords'
            referencedColumns: ['id']
          }
        ]
      }
      leases: {
        Row: {
          id: string
          unit_id: string
          tenant_id: string | null
          monthly_rent: number
          start_date: string
          end_date: string | null
          deposit_amount: number | null
          status: 'active' | 'expired' | 'terminated'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          unit_id: string
          tenant_id?: string | null
          monthly_rent: number
          start_date: string
          end_date?: string | null
          deposit_amount?: number | null
          status?: 'active' | 'expired' | 'terminated'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          unit_id?: string
          tenant_id?: string | null
          monthly_rent?: number
          start_date?: string
          end_date?: string | null
          deposit_amount?: number | null
          status?: 'active' | 'expired' | 'terminated'
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'leases_unit_id_fkey'
            columns: ['unit_id']
            isOneToOne: false
            referencedRelation: 'units'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'leases_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          }
        ]
      }
      expense_categories: {
        Row: {
          id: string
          name: string
          type: 'income' | 'expense'
          is_recurring: boolean
          is_system: boolean
        }
        Insert: {
          id?: string
          name: string
          type: 'income' | 'expense'
          is_recurring?: boolean
          is_system?: boolean
        }
        Update: {
          id?: string
          name?: string
          type?: 'income' | 'expense'
          is_recurring?: boolean
          is_system?: boolean
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          landlord_id: string
          property_id: string | null
          unit_id: string | null
          type: 'income' | 'expense'
          category: string
          amount: number
          transaction_date: string
          description: string | null
          source: 'manual' | 'receipt_scan' | 'recurring'
          receipt_id: string | null
          is_tax_deductible: boolean
          created_at: string
        }
        Insert: {
          id?: string
          landlord_id: string
          property_id?: string | null
          unit_id?: string | null
          type: 'income' | 'expense'
          category: string
          amount: number
          transaction_date: string
          description?: string | null
          source?: 'manual' | 'receipt_scan' | 'recurring'
          receipt_id?: string | null
          is_tax_deductible?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          landlord_id?: string
          property_id?: string | null
          unit_id?: string | null
          type?: 'income' | 'expense'
          category?: string
          amount?: number
          transaction_date?: string
          description?: string | null
          source?: 'manual' | 'receipt_scan' | 'recurring'
          receipt_id?: string | null
          is_tax_deductible?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_landlord_id_fkey'
            columns: ['landlord_id']
            isOneToOne: false
            referencedRelation: 'landlords'
            referencedColumns: ['id']
          }
        ]
      }
      receipts: {
        Row: {
          id: string
          landlord_id: string
          property_id: string | null
          vendor_name: string | null
          amount: number | null
          receipt_date: string | null
          category: string | null
          description: string | null
          ai_raw_json: Json | null
          ai_confidence: number | null
          status: 'pending' | 'confirmed' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          landlord_id: string
          property_id?: string | null
          vendor_name?: string | null
          amount?: number | null
          receipt_date?: string | null
          category?: string | null
          description?: string | null
          ai_raw_json?: Json | null
          ai_confidence?: number | null
          status?: 'pending' | 'confirmed' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          landlord_id?: string
          property_id?: string | null
          vendor_name?: string | null
          amount?: number | null
          receipt_date?: string | null
          category?: string | null
          description?: string | null
          ai_raw_json?: Json | null
          ai_confidence?: number | null
          status?: 'pending' | 'confirmed' | 'rejected'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'receipts_landlord_id_fkey'
            columns: ['landlord_id']
            isOneToOne: false
            referencedRelation: 'landlords'
            referencedColumns: ['id']
          }
        ]
      }
      recurring_payments: {
        Row: {
          id: string
          landlord_id: string
          property_id: string
          name: string
          category: string
          amount: number
          frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually'
          next_due_date: string
          reminder_days_before: number
          auto_log_transaction: boolean
          is_active: boolean
          notes: string | null
          created_at: string
          last_paid_date: string | null
          last_paid_amount: number | null
        }
        Insert: {
          id?: string
          landlord_id: string
          property_id: string
          name: string
          category: string
          amount: number
          frequency?: 'weekly' | 'monthly' | 'quarterly' | 'annually'
          next_due_date: string
          reminder_days_before?: number
          auto_log_transaction?: boolean
          is_active?: boolean
          notes?: string | null
          created_at?: string
          last_paid_date?: string | null
          last_paid_amount?: number | null
        }
        Update: {
          id?: string
          landlord_id?: string
          property_id?: string
          name?: string
          category?: string
          amount?: number
          frequency?: 'weekly' | 'monthly' | 'quarterly' | 'annually'
          next_due_date?: string
          reminder_days_before?: number
          auto_log_transaction?: boolean
          is_active?: boolean
          notes?: string | null
          created_at?: string
          last_paid_date?: string | null
          last_paid_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'recurring_payments_landlord_id_fkey'
            columns: ['landlord_id']
            isOneToOne: false
            referencedRelation: 'landlords'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'recurring_payments_property_id_fkey'
            columns: ['property_id']
            isOneToOne: false
            referencedRelation: 'properties'
            referencedColumns: ['id']
          }
        ]
      }
      reminders: {
        Row: {
          id: string
          recurring_payment_id: string
          landlord_id: string
          due_date: string
          status: 'pending' | 'sent' | 'dismissed' | 'paid'
          sent_at: string | null
          dismissed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recurring_payment_id: string
          landlord_id: string
          due_date: string
          status?: 'pending' | 'sent' | 'dismissed' | 'paid'
          sent_at?: string | null
          dismissed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recurring_payment_id?: string
          landlord_id?: string
          due_date?: string
          status?: 'pending' | 'sent' | 'dismissed' | 'paid'
          sent_at?: string | null
          dismissed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reminders_landlord_id_fkey'
            columns: ['landlord_id']
            isOneToOne: false
            referencedRelation: 'landlords'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reminders_recurring_payment_id_fkey'
            columns: ['recurring_payment_id']
            isOneToOne: false
            referencedRelation: 'recurring_payments'
            referencedColumns: ['id']
          }
        ]
      }
      reports: {
        Row: {
          id: string
          landlord_id: string
          property_id: string | null
          report_type: 'pl' | 'cash_flow' | 'tax_summary' | 'expense_breakdown' | 'roi'
          period_start: string
          period_end: string
          data_snapshot: Json
          format: 'json' | 'pdf' | 'csv'
          generated_at: string
        }
        Insert: {
          id?: string
          landlord_id: string
          property_id?: string | null
          report_type: 'pl' | 'cash_flow' | 'tax_summary' | 'expense_breakdown' | 'roi'
          period_start: string
          period_end: string
          data_snapshot: Json
          format?: 'json' | 'pdf' | 'csv'
          generated_at?: string
        }
        Update: {
          id?: string
          landlord_id?: string
          property_id?: string | null
          report_type?: 'pl' | 'cash_flow' | 'tax_summary' | 'expense_breakdown' | 'roi'
          period_start?: string
          period_end?: string
          data_snapshot?: Json
          format?: 'json' | 'pdf' | 'csv'
          generated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reports_landlord_id_fkey'
            columns: ['landlord_id']
            isOneToOne: false
            referencedRelation: 'landlords'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience row types
export type Landlord = Database['public']['Tables']['landlords']['Row']
export type SignupAudit = Database['public']['Tables']['signup_audit']['Row']
export type Property = Database['public']['Tables']['properties']['Row']
export type Unit = Database['public']['Tables']['units']['Row']
export type Tenant = Database['public']['Tables']['tenants']['Row']
export type Lease = Database['public']['Tables']['leases']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Receipt = Database['public']['Tables']['receipts']['Row']
export type RecurringPayment = Database['public']['Tables']['recurring_payments']['Row']
export type Reminder = Database['public']['Tables']['reminders']['Row']
export type Report = Database['public']['Tables']['reports']['Row']
export type ExpenseCategory = Database['public']['Tables']['expense_categories']['Row']
