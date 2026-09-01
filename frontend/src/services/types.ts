// ── Shared TypeScript interfaces matching backend response shapes ──

export interface Ward {
  id: number;
  name: string;
  infra_index: number;
  budget_index: number;
}

export type Channel = 'text' | 'voice' | 'whatsapp';
export type ComplaintStatus = 'submitted' | 'under_review' | 'approved' | 'resolved';

export interface Complaint {
  id: number;
  tracking_id: string;
  ward_id: number;
  raw_text: string;
  language: string;
  channel: Channel;
  category: string;
  confidence: number;
  urgency: number;
  status: ComplaintStatus;
  created_at: string;
}

export interface SubmitComplaintBody {
  ward_id: number;
  raw_text: string;
  language: string;
  channel: Channel;
}

export interface DashboardSummary {
  total_requests: number;
  wards_covered: number;
  high_urgency_count: number;
  top_category: string | null;
}

export interface PriorityRow {
  ward_name: string;
  complaint_count: number;
  demand_score: number;
  infra_gap: number;
  budget_gap: number;
  priority_score: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface ResetDemoResponse {
  status: string;
  message: string;
}

export interface TTSRequest {
  text: string;
  language?: string;
  voice?: string;
  speed?: number;
}

export interface TTSResponse {
  status: string;
  original_text: string;
  spoken_text: string;
  language: string;
  voice: string;
  speed: number;
  estimated_duration_seconds: number;
  engine: string;
  nvidia_active: boolean;
}
