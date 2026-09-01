import axios from 'axios';
import type {
  Ward,
  Complaint,
  SubmitComplaintBody,
  DashboardSummary,
  PriorityRow,
  CategoryCount,
  ResetDemoResponse,
  TTSRequest,
  TTSResponse,
} from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const DASHBOARD_API_KEY = import.meta.env.VITE_DASHBOARD_API_KEY ?? '';

// Public client — no auth header
const publicClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Dashboard client — includes X-API-Key header
const dashboardClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(DASHBOARD_API_KEY ? { 'X-API-Key': DASHBOARD_API_KEY } : {}),
  },
  timeout: 15000,
});

// ── Wards ────────────────────────────────────────────────────
export const getWards = (): Promise<Ward[]> =>
  publicClient.get<Ward[]>('/api/wards').then((r) => r.data);

// ── Complaints ───────────────────────────────────────────────
export const submitComplaint = (body: SubmitComplaintBody): Promise<Complaint> =>
  publicClient.post<Complaint>('/api/complaints', body).then((r) => r.data);

export const getComplaints = (limit = 25): Promise<Complaint[]> =>
  publicClient.get<Complaint[]>('/api/complaints', { params: { limit } }).then((r) => r.data);

export const getComplaintByTrackingId = (trackingId: string): Promise<Complaint> =>
  publicClient.get<Complaint>(`/api/complaints/${trackingId}`).then((r) => r.data);

// ── Dashboard ────────────────────────────────────────────────
export const getDashboardSummary = (): Promise<DashboardSummary> =>
  dashboardClient.get<DashboardSummary>('/api/dashboard/summary').then((r) => r.data);

export const getDashboardPriorities = (): Promise<PriorityRow[]> =>
  dashboardClient.get<PriorityRow[]>('/api/dashboard/priorities').then((r) => r.data);

export const getDashboardCategories = (): Promise<CategoryCount[]> =>
  dashboardClient.get<CategoryCount[]>('/api/dashboard/categories').then((r) => r.data);

export const resetDemo = (): Promise<ResetDemoResponse> =>
  dashboardClient.post<ResetDemoResponse>('/api/dashboard/reset-demo').then((r) => r.data);

// ── Text-To-Speech (TTS) ──────────────────────────────────────
export const synthesizeTTS = (body: TTSRequest): Promise<TTSResponse> =>
  publicClient.post<TTSResponse>('/api/v1/tts/synthesize', body).then((r) => r.data);
