export interface MetaResponse {
  code: number;
  status: string;
  message: string;
}

export interface APIResponse<T = any> {
  meta: MetaResponse;
  data: T;
}

export interface User {
  id: string;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  user_id?: string | null;
  name: string;
  type: CategoryType;
  icon?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  category?: Category;
  amount: number;
  date: string;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id?: string | null;
  category?: Category | null;
  amount: number;
  month: number;
  year: number;
  spent_amount?: number; // Calculated dynamically on frontend/report
  created_at?: string;
  updated_at?: string;
}

export interface AgendaMember {
  id: string;
  agenda_id: string;
  user_id: string;
  user?: User;
  role: 'owner' | 'member';
  created_at?: string;
}

export interface Agenda {
  id: string;
  title: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  status: 'pending' | 'completed' | 'terlaksana';
  members?: AgendaMember[];
  created_at?: string;
  updated_at?: string;
}

export interface SavingContribution {
  id: string;
  goal_id: string;
  user_id: string;
  user?: User;
  amount: number;
  type: 'contribute' | 'withdraw' | 'deposit';
  notes?: string | null;
  created_at?: string;
}

export interface SavingMember {
  id: string;
  goal_id: string;
  user_id: string;
  user?: User;
  role: 'owner' | 'member';
  created_at?: string;
}

export interface SavingGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  members?: SavingMember[];
  contributions?: SavingContribution[];
  created_at?: string;
  updated_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type?: string;
  is_read: boolean;
  created_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
}

export interface FinancialReportData {
  total_income: number;
  total_expense: number;
  net_income: number;
  transactions_count: number;
  daily_average_expense: number;
  category_breakdown: Array<{
    category_id: string;
    category_name: string;
    type: CategoryType;
    total: number;
    percentage: number;
  }>;
}
