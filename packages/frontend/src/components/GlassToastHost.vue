<script setup lang="ts">
/** 渲染 `useGlassToast()` 推入队列的 Toast，顶部居中依次排下去。挂在 `App` 里一次即可。 */
import GlassToast from '@/components/GlassToast.vue';
import { glassToastStack, removeGlassToast } from '@/composables/useGlassToast.ts';
</script>

<template>
    <div class="glass-toast-host">
        <GlassToast
            v-for="toast in glassToastStack"
            :key="toast.id"
            :type="toast.type"
            :text="toast.text"
            :closing="toast.closing"
            @closed="removeGlassToast(toast.id)"
        />
    </div>
</template>

<style scoped>
.glass-toast-host {
    position: fixed;
    top: calc(var(--ui-space-4) + env(safe-area-inset-top));
    left: 50%;
    z-index: 2000;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--ui-space-2);
    transform: translateX(-50%);
    /* 只提示，不挡点击。 */
    pointer-events: none;
}

@media (max-width: 768px) {
    /* 移动端顶栏在同样的位置上。 */
    .glass-toast-host {
        top: calc(var(--ui-mobile-top-bar-height) + var(--ui-space-2));
    }
}
</style>
