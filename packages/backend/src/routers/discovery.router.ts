import Router from 'koa-router';
import { Context, DefaultState } from 'koa';
import { requiresPermission } from '@/middlewares/authorization';
import { Permission, ROLE_ADMIN } from '@/shared/permission';
import { DiscoveryService } from '@/services/discovery.service';
import { logger } from '@/lib/logger';

const router = new Router<DefaultState, Context>({ prefix: '/discover' });

router.post(
    '/article-plaza/start',
    requiresPermission(Permission.MANAGE_DISCOVERY),
    async (ctx: Context) => {
        try {
            const result = await DiscoveryService.startArticlePlazaDiscovery(
                ctx.request.body || {}
            );
            ctx.success({
                runId: result.run.id,
                taskIds: result.taskIds,
                run: result.run
            });
        } catch (error) {
            logger.error({ error }, 'Failed to start article plaza discovery');
            ctx.fail(
                500,
                error instanceof Error ? error.message : 'Failed to start article plaza discovery'
            );
        }
    }
);

router.post('/user/:uid/articles/start', async (ctx: Context) => {
    try {
        const body = (ctx.request.body || {}) as { forceUpdate?: boolean; maxPages?: number };
        if (body.forceUpdate === true) {
            const role = ctx.user?.role;
            const canForceUpdate =
                role === ROLE_ADMIN ||
                (role !== undefined &&
                    (role & Permission.MANAGE_DISCOVERY) === Permission.MANAGE_DISCOVERY);
            if (!canForceUpdate) {
                ctx.fail(403, 'Permission denied');
                return;
            }
        }

        const result = await DiscoveryService.startUserArticleDiscovery({
            ...body,
            uid: ctx.params.uid
        });
        ctx.success({
            runId: result.run.id,
            taskIds: result.taskIds,
            run: result.run
        });
    } catch (error) {
        logger.error({ error, uid: ctx.params.uid }, 'Failed to start user article discovery');
        ctx.fail(
            400,
            error instanceof Error ? error.message : 'Failed to start user article discovery'
        );
    }
});

router.get('/runs', requiresPermission(Permission.MANAGE_DISCOVERY), async (ctx: Context) => {
    const limit = Number(ctx.query.limit) || 20;
    ctx.success(await DiscoveryService.listRuns(limit));
});

router.get('/runs/:id', requiresPermission(Permission.MANAGE_DISCOVERY), async (ctx: Context) => {
    const run = await DiscoveryService.getRunById(ctx.params.id);
    if (!run) {
        ctx.fail(404, 'Discovery run not found');
        return;
    }
    ctx.success(run);
});

router.post(
    '/runs/:id/stop',
    requiresPermission(Permission.MANAGE_DISCOVERY),
    async (ctx: Context) => {
        const run = await DiscoveryService.getRunById(ctx.params.id);
        if (!run) {
            ctx.fail(404, 'Discovery run not found');
            return;
        }
        await DiscoveryService.stopRun(ctx.params.id);
        ctx.success({ runId: ctx.params.id });
    }
);

export default router;
