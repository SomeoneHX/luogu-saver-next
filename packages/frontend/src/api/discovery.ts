import { apiFetch } from '@/utils/request.ts';
import type { ApiResponse } from '@/types/common';
import type { DiscoveryRun } from '@/api/admin.ts';

export async function startUserArticleDiscovery(data: {
    uid: number;
    maxPages?: number;
    forceUpdate?: boolean;
}) {
    return (await apiFetch(`/discover/user/${data.uid}/articles/start`, {
        method: 'POST',
        data: {
            maxPages: data.maxPages,
            forceUpdate: data.forceUpdate
        }
    })) as ApiResponse<{ runId: string; taskIds: string[]; run: DiscoveryRun }>;
}
