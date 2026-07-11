import { apiFetch } from '@/utils/request.ts';
import type { ApiResponse } from '@/types/common';

export interface Advertisement {
    id: number;
    imageUrl: string;
    altText: string;
    targetUrl: string | null;
    sortOrder: number;
}

export async function getCurrentAdvertisements() {
    return (await apiFetch('/advertisement/current')) as ApiResponse<{
        advertisements: Advertisement[];
    }>;
}
