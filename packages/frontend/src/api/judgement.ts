import axios from 'axios';

const judgementApi = axios.create({
    baseURL: 'https://jdmt.luogu.me',
    timeout: 30000,
    paramsSerializer: {
        serialize(params) {
            const query = new URLSearchParams();
            for (const [key, value] of Object.entries(params)) {
                if (value === undefined || value === null) continue;
                query.set(key, Array.isArray(value) ? value.join(',') : String(value));
            }
            return query.toString();
        }
    }
});

export interface JudgementItem {
    id: number;
    uid: number;
    name: string;
    reason: string;
    revoked_permission: number;
    added_permission: number;
    time: number;
    user: JudgementUser;
    full_record: Record<string, unknown>;
    fetch_log_id: number | null;
    log_fetched_at: string | null;
    created_at: string;
}

export interface JudgementUser {
    color?: string;
    badge?: string;
    ccfLevel?: number;
    xcpcLevel?: number;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}

export interface JudgementListResponse {
    success: boolean;
    data: JudgementItem[];
    pagination: PaginationMeta;
}

export interface JudgementQueryParams {
    page?: number;
    limit?: number;
    uid?: number[];
    name?: string;
    rev_perm?: number[];
    add_perm?: number[];
    no_perm?: number;
}

export async function getJudgements(params?: JudgementQueryParams): Promise<JudgementListResponse> {
    const response = await judgementApi.get<JudgementListResponse>('/api/judgement', { params });
    return response.data;
}
