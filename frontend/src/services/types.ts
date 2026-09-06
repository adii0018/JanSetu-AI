// ── Shared TypeScript interfaces matching backend response shapes ──

export interface Ward {
  id: number;
  name: string;
  infra_index: number;
  budget_index: number;
  lat?: number;
  lng?: number;
}

export type Channel = 'text' | 'voice' | 'whatsapp';
export type ComplaintStatus = 'submitted' | 'under_review' | 'approved' | 'resolved';

export interface Complaint {
  id: number;
  tracking_id: string;
  user_id?: number;
  user_email?: string;
  ward_id: number;
  raw_text: string;
  language: string;
  channel: Channel;
  category: string;
  confidence: number;
  urgency: number;
  status: ComplaintStatus;
  upvote_count: number;
  created_at: string;
}

export interface MapWard {
  id: number;
  name: string;
  lat: number;
  lng: number;
  complaint_count: number;
  avg_urgency: number;
  infra_index: number;
  budget_index: number;
}

export interface SubmitComplaintBody {
  ward_id: number;
  raw_text: string;
  language: string;
  channel: Channel;
  user_id?: number;
  user_email?: string;
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

export interface SemanticCluster {
  cluster_id: string;
  category: string;
  location: string;
  cluster_name: string;
  count: number;
  demand_multiplier: number;
  avg_urgency: number;
  sample_texts: string[];
  complaint_ids: string[];
  merged_by_ai: boolean;
}

export interface SemanticClustersResponse {
  status: string;
  algorithm: string;
  total_complaints_analyzed: number;
  total_semantic_clusters: number;
  clusters: SemanticCluster[];
}

export interface GeoCluster {
  hotspot_id: string;
  name: string;
  ward_names: string[];
  total_wards: number;
  center_lat: number;
  center_lng: number;
  total_complaints: number;
  avg_urgency: number;
  hotspot_level: string;
  ml_algorithm: string;
}

export interface GeoClustersResponse {
  status: string;
  algorithm: string;
  total_wards_analyzed: number;
  total_hotspots_detected: number;
  clusters: GeoCluster[];
}
