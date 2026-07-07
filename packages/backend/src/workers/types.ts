import { CommonTask } from '@/shared/task';
import { Job } from 'bullmq';

export interface TaskHandler<T extends CommonTask> {
    handle(task: T, job: Job<T>): Promise<WorkflowResult<any>>;
    taskType: string;
}

export interface WorkflowResult<T> {
    skipNextStep: boolean;
    data: T;
}

export type ChildrenValues = { [p: string]: WorkflowResult<any> };

export interface TaskCommonResult {
    [key: string]: any;
}

export interface TaskTextResult extends TaskCommonResult {
    text: string;
}

export interface TaskEmbeddingResult extends TaskCommonResult {
    embedding: number[];
    text?: string;
    embeddingLength?: number;
    embeddingRecords?: TaskEmbeddingRecord[];
}

export interface TaskEmbeddingRecord {
    kind: 'summary' | 'chunk';
    document: string;
    embedding: number[];
    chunkIndex?: number;
    start?: number;
    end?: number;
}

export interface TaskCensorResult extends TaskCommonResult {
    rating: number;
    category: string;
    reason: string;
    userDisplayMessage: string;
}
