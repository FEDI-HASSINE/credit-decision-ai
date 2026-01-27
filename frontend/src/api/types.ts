export type Role = "client" | "banker";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: Role;
  user_id: string;
}

export interface CreditRequestCreate {
  amount: number;
  duration_months: number;
  monthly_income: number;
  monthly_charges: number;
  employment_type: string;
  contract_type: string;
  seniority_years: number;
  family_status: string;
  documents: string[];
  other_income?: number;
  marital_status?: string;
  number_of_children?: number;
  spouse_employed?: boolean;
  housing_status?: string;
  is_primary_holder?: boolean;
  telemetry?: Record<string, unknown>;
  documents_payloads?: Record<string, unknown>[];
  document_texts?: Record<string, string>;
  transaction_flags?: string[];
  image_flags?: string[];
  free_text?: string[];
  declared_profile?: Record<string, unknown>;
}

export interface AgentResult {
  name: string;
  score?: number;
  flags?: string[];
  explanations?: {
    flag_explanations?: Record<string, string>;
    internal_explanation?: unknown;
    customer_explanation?: unknown;
    global_summary?: string;
    document_details?: {
      consistency_level?: string;
      dds_score?: number;
      extracted_fields?: {
        income_documented?: number;
        contract_type_detected?: string;
        seniority_detected_years?: number;
      };
      missing_documents?: string[];
      suspicious_patterns?: string[];
    };
    decision_details?: {
      recommendation?: string;
      confidence?: number;
      human_review_required?: boolean;
      reasons?: Array<{ code?: string; label?: string }>;
      review_triggers?: string[];
      conflicts?: Array<{ type?: string; severity?: string; description?: string }>;
      risk_indicators?: string[];
      summary?: string;
    };
    similarity_details?: {
      report?: string;
      breakdown?: {
        ok?: number;
        default?: number;
        fraud?: number;
      };
      buckets?: Array<{
        label?: string;
        min?: number;
        max?: number;
        count?: number;
        default_count?: number;
        fraud_count?: number;
        default_rate?: number;
        fraud_rate?: number;
        avg_similarity?: number;
      }>;
      cases?: Array<{
        case_id?: string | number;
        similarity_score?: number;
        similarity_pct?: number;
        status?: string;
        loan_amount?: number;
        loan_duration?: number;
        employment_type?: string;
        contract_type?: string;
      }>;
      stats?: {
        total_similar_cases?: number;
        similar_good_profiles?: number;
        similar_bad_profiles?: number;
        fraud_cases?: number;
        repayment_success_rate?: number;
        default_rate?: number;
        fraud_ratio?: number;
        average_similarity?: number;
        min_similarity?: number;
        median_similarity?: number;
        max_similarity?: number;
      };
      analysis?: {
        recommendation?: string;
        risk_level?: string;
        risk_score?: number;
        confidence_level?: string;
        points_forts?: string[];
        points_faibles?: string[];
        conditions?: string[];
        summary?: string;
        reasoning?: string;
        payment_history_assessment?: {
          label?: string;
          note?: string;
        };
      };
    };
  };
  confidence?: number;
}

export interface AgentBundle {
  document?: AgentResult;
  similarity?: AgentResult;
  fraud?: AgentResult;
  decision?: AgentResult;
  explanation?: AgentResult;
  behavior?: AgentResult;
  image?: AgentResult;
}

export interface DocumentInfo {
  document_id: number;
  document_type: string;
  file_path: string;
  file_hash: string;
  uploaded_at: string;
}

export interface Comment {
  author_id: string;
  message: string;
  created_at: string;
  is_public?: boolean;
}

export interface DecisionInfo {
  decision: "approve" | "reject" | "review";
  confidence?: number;
  reason_codes?: Record<string, unknown>;
  note?: string;
  decided_by?: string;
  decided_at?: string;
}

export interface LoanInfo {
  loan_id: number;
  user_id: number;
  case_id?: number;
  principal_amount: number;
  interest_rate: number;
  term_months: number;
  status: string;
  approved_at?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface InstallmentInfo {
  installment_id: number;
  loan_id: number;
  installment_number: number;
  due_date: string;
  amount_due: number;
  status: string;
  amount_paid: number;
  paid_at?: string;
  days_late?: number;
  created_at: string;
}

export interface PaymentInfo {
  payment_id: number;
  loan_id: number;
  installment_id?: number;
  payment_date: string;
  amount: number;
  channel: string;
  status: string;
  is_reversal: boolean;
  reversal_of?: number | null;
  created_at: string;
}

export interface PaymentBehaviorSummary {
  summary_id: number;
  user_id: number;
  total_loans: number;
  total_installments: number;
  on_time_installments: number;
  late_installments: number;
  missed_installments: number;
  on_time_rate: number;
  avg_days_late: number;
  max_days_late: number;
  avg_payment_amount: number;
  last_payment_date?: string;
  updated_at: string;
}

export interface CreditRequest {
  id: string;
  status: "pending" | "in_review" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  client_id: string;
  summary?: string;
  customer_explanation?: string;
  agents?: AgentBundle;
  decision?: DecisionInfo;
  comments?: Comment[];
  auto_decision?: string;
  auto_decision_confidence?: number;
  auto_review_required?: boolean;
  loan?: LoanInfo;
  installments?: InstallmentInfo[];
  payments?: PaymentInfo[];
  payment_behavior_summary?: PaymentBehaviorSummary;
}

export interface BankerRequest {
  id: string;
  status: "pending" | "in_review" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  client_id: string;
  summary?: string;
  amount?: number;
  duration_months?: number;
  monthly_income?: number;
  other_income?: number;
  monthly_charges?: number;
  employment_type?: string;
  contract_type?: string;
  seniority_years?: number;
  marital_status?: string;
  number_of_children?: number;
  spouse_employed?: boolean;
  housing_status?: string;
  is_primary_holder?: boolean;
  documents?: DocumentInfo[];
  agents?: AgentBundle;
  comments?: Comment[];
  decision?: DecisionInfo;
  auto_decision?: string;
  auto_decision_confidence?: number;
  auto_review_required?: boolean;
  loan?: LoanInfo;
  installments?: InstallmentInfo[];
  payments?: PaymentInfo[];
  payment_behavior_summary?: PaymentBehaviorSummary;
}

export interface AgentChatMessage {
  role: "banker" | "agent";
  content: string;
  created_at: string;
  structured_output?: Record<string, unknown>;
}

export interface AgentChatRequest {
  agent_name: string;
  message: string;
}

export interface AgentChatResponse {
  agent_name: string;
  messages: AgentChatMessage[];
}

export interface CommentCreate {
  message: string;
}

export interface DecisionCreate {
  decision: "approve" | "reject" | "review";
  note?: string;
}
