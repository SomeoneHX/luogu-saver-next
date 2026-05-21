import { ReadTask } from '@/shared/task';
import { ChildrenValues, TaskHandler, TaskTextResult, WorkflowResult } from '@/workers/types';

export class ReadPlannedQueryHandler implements TaskHandler<ReadTask> {
    public taskType = 'read:planned_query';

    public async handle(
        task: ReadTask,
        job: any
    ): Promise<WorkflowResult<TaskTextResult & { queryIndex: number }>> {
        const childrenValues = (await job.getChildrenValues()) as ChildrenValues;
        const queryIndex = Math.max(0, Math.floor(Number(task.payload.metadata?.queryIndex) || 0));
        const queries = this.extractQueries(childrenValues);
        const text = queries[queryIndex] || '';

        return {
            skipNextStep: !text,
            data: {
                text,
                queryIndex
            }
        };
    }

    private extractQueries(childrenValues: ChildrenValues): string[] {
        for (const value of Object.values(childrenValues)) {
            const queries = value?.data?.queries;
            if (Array.isArray(queries)) {
                return queries.filter(query => typeof query === 'string' && query.trim());
            }
        }
        return [];
    }
}
