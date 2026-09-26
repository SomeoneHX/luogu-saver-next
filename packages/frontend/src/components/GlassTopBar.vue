<script setup lang="ts">
/**
 * Mobile top bar for the destinations the bottom bar does not cover: a back button plus the route
 * title, on a glass that blurs whatever slides underneath it.
 */
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronLeft } from 'lucide-vue-next';

import GlassSurface from '@/liquid-glass/components/GlassSurface.vue';
import type { BackdropEffectScope } from '@/liquid-glass/core/backdrop';
import { RootBackdrop } from '@/liquid-glass/core/backdrop';
import { dp } from '@/liquid-glass/core/geometry';
import { Rectangle } from '@/liquid-glass/core/shapes';

const route = useRoute();
const router = useRouter();

const title = computed(() => (route.meta.title as string | undefined) ?? '');

const effects = (scope: BackdropEffectScope): void => {
    scope.vibrancy();
    scope.blur(dp(8));
};

/** Back to the previous entry, or home when this page was opened directly. */
function goBack(): void {
    if (window.history.state?.back) router.back();
    else void router.push('/');
}
</script>

<template>
    <div class="glass-top-bar" role="banner">
        <GlassSurface
            class="glass-top-bar__surface"
            content-class="glass-top-bar__content"
            :backdrop="RootBackdrop"
            :shape="Rectangle"
            :effects="effects"
            :highlight="() => null"
            :shadow="() => null"
        >
            <button class="glass-top-bar__back" type="button" aria-label="返回" @click="goBack">
                <ChevronLeft :size="22" aria-hidden="true" />
            </button>
            <span class="glass-top-bar__title">{{ title }}</span>
        </GlassSurface>
    </div>
</template>

<style scoped>
.glass-top-bar {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 1050;
    /* Only the button takes pointers; the bar itself must not block the page. */
    pointer-events: none;
}

.glass-top-bar__surface {
    display: block;
    width: 100%;
    height: var(--ui-mobile-top-bar-height);
}

/* The content layer is rendered inside GlassSurface, so it needs `:deep()` to be reachable here. */
.glass-top-bar__surface :deep(.glass-top-bar__content) {
    display: flex;
    align-items: center;
    gap: var(--ui-space-2);
    height: 100%;
    padding: 0 var(--ui-space-3);
    padding-top: env(safe-area-inset-top);
    color: var(--ui-text-color);
}

.glass-top-bar__back {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    color: inherit;
    background: none;
    border: 0;
    border-radius: 50%;
    cursor: pointer;
    pointer-events: auto;
}

.glass-top-bar__title {
    overflow: hidden;
    font-size: 16px;
    font-weight: 600;
    white-space: nowrap;
    text-overflow: ellipsis;
}
</style>
