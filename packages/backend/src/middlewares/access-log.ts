import { Context, Next } from 'koa';
import { logger } from '@/lib/logger';
import { getClientIp } from '@/middlewares/client-ip';

export const accessLog = async (ctx: Context, next: Next) => {
    try {
        await next();
    } finally {
        logger.info(
            {
                ip: getClientIp(ctx),
                userId: ctx.user?.id ?? null,
                method: ctx.method,
                path: ctx.path,
                status: ctx.status
            },
            'HTTP access'
        );
    }
};
