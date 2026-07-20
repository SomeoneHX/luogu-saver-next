import type { RouteRecordRaw } from 'vue-router';

export default [
    {
        path: '/judgement',
        name: 'judgement',
        component: () => import('@/views/judgement/JudgementView.vue'),
        meta: {
            activeMenu: 'judgement',
            title: '陶片放逐'
        }
    },
    {
        path: '/judgement/logs',
        name: 'judgement-logs',
        component: () => import('@/views/judgement/JudgementLogsView.vue'),
        meta: {
            activeMenu: 'judgement',
            title: '陶片放逐同步日志'
        }
    }
] as RouteRecordRaw[];
