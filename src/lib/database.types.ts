export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string
          name: string
          position: string
          join_date: string
        }
        Insert: {
          id?: string
          name: string
          position: string
          join_date?: string
        }
      }
      payments: {
        Row: {
          id: string
          employee_id: string
          date: string
          amount: number
          status: 'paid' | 'unpaid'
          is_leave: boolean
        }
        Insert: {
          id?: string
          employee_id: string
          date: string
          amount: number
          status: 'paid' | 'unpaid'
          is_leave?: boolean
        }
      }
    }
  }
}