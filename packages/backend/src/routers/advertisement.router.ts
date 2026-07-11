import Router from 'koa-router';
import { Context, DefaultState } from 'koa';
import { AdvertisementService } from '@/services/advertisement.service';

const router = new Router<DefaultState, Context>({ prefix: '/advertisement' });

router.get('/current', async (ctx: Context) => {
    const advertisements = await AdvertisementService.getCurrentAdvertisements();
    ctx.success({ advertisements });
});

export default router;
