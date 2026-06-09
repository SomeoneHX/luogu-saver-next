import { Context } from 'koa';

function firstHeaderValue(value: string | string[] | undefined): string | null {
    if (Array.isArray(value)) {
        return value[0]?.trim() || null;
    }
    return value?.trim() || null;
}

export function getClientIp(ctx: Context): string {
    const cloudflareIp = firstHeaderValue(ctx.headers['cf-connecting-ip']);
    if (cloudflareIp) return cloudflareIp;

    const forwardedFor = firstHeaderValue(ctx.headers['x-forwarded-for']);
    const forwardedIp = forwardedFor?.split(',')[0]?.trim();
    if (forwardedIp) return forwardedIp;

    return ctx.ip;
}
