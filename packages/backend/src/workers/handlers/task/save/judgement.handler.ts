import { UnrecoverableError } from 'bullmq';
import type { SaveTask } from '@/shared/task';
import { JudgementService, type JudgementSyncResult } from '@/services/judgement.service';
import type { TaskHandler, WorkflowResult } from '@/workers/types';

export class JudgementHandler implements TaskHandler<SaveTask> {
    public taskType = 'save:judgement';

    public async handle(task: SaveTask): Promise<WorkflowResult<JudgementSyncResult>> {
        if (task.payload.targetId !== 'latest') {
            throw new UnrecoverableError('Judgement targetId must be latest');
        }
        return {
            skipNextStep: false,
            data: await JudgementService.syncFromLuogu()
        };
    }
}
