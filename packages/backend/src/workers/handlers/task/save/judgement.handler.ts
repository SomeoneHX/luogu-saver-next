import { UnrecoverableError } from 'bullmq';
import type { SaveTask } from '@/shared/task';
import { logger } from '@/lib/logger';
import { JudgementService, type JudgementSyncResult } from '@/services/judgement.service';
import { JudgementUpstreamService } from '@/services/judgement-upstream.service';
import { normalizeErrorReason } from '@/utils/error-reason';
import type { TaskHandler, WorkflowResult } from '@/workers/types';

export class JudgementHandler implements TaskHandler<SaveTask> {
    public taskType = 'save:judgement';

    public async handle(task: SaveTask): Promise<WorkflowResult<JudgementSyncResult>> {
        if (task.payload.targetId !== 'latest') {
            throw new UnrecoverableError('Judgement targetId must be latest');
        }

        try {
            const upstream = await JudgementUpstreamService.fetch();
            return {
                skipNextStep: false,
                data: await JudgementService.persistFetchedResult(upstream)
            };
        } catch (error) {
            const reason = normalizeErrorReason(error);
            try {
                await JudgementService.recordFetchFailure(reason);
            } catch (logError) {
                logger.error(
                    { reason: normalizeErrorReason(logError) },
                    'Failed to persist judgement synchronization error log'
                );
            }
            logger.error({ reason }, 'Judgement synchronization failed');
            throw new Error(reason);
        }
    }
}
