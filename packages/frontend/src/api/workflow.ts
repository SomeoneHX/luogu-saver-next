import { apiFetch } from '@/utils/request.ts';
import type { ApiResponse } from '@/types/common';

interface CreateWorkflowTemplateResponse {
    workflowId: string;
    taskId: string;
    jobIds: Record<string, string>;
}

export async function createWorkflowFromTemplate(name: string, params: Record<string, unknown>) {
    return (await apiFetch(`/workflow/create/template/${name}`, {
        method: 'POST',
        data: params
    })) as ApiResponse<CreateWorkflowTemplateResponse>;
}
