<script setup lang="ts">
/**
 * 一条胶囊玻璃 Toast。排队、定位、停留时长都在宿主与 `useGlassToast` 里，这里只画自己。
 *
 * 淡入淡出落在玻璃的各层上（`opacity < 1` 的祖先会形成 backdrop root，玻璃就采不到背后的页面），
 * 缩放落在卡片本身（transform 不在那类属性里）。
 */
import { computed, inject } from 'vue';
import { CircleCheck, CircleX, Info, TriangleAlert } from 'lucide-vue-next';

import GlassSurface from '@/liquid-glass/components/GlassSurface.vue';
import type { BackdropEffectScope, Highlight } from '@/liquid-glass/core/backdrop';
import { HighlightStyles, RootBackdrop } from '@/liquid-glass/core/backdrop';
import { dp } from '@/liquid-glass/core/geometry';
import { Capsule } from '@/liquid-glass/core/shapes';
import type { GlassToastType } from '@/composables/useGlassToast';
import { uiThemeKey } from '@/styles/theme/themeKeys.ts';
import { isLightColor } from '@/utils/ui-theme.ts';

const props = defineProps<{ type: GlassToastType; text: string; closing: boolean }>();

const emit = defineEmits<{ closed: [] }>();

const icons = {
    success: CircleCheck,
    error: CircleX,
    warning: TriangleAlert,
    info: Info
};

const icon = computed(() => icons[props.type]);
const accent = computed(() => `var(--ui-${props.type}-color)`);

const uiThemeVars = inject(uiThemeKey);
const isLightTheme = computed(() => isLightColor(uiThemeVars?.value.bodyColor ?? '#ffffff'));

const highlight = (): Highlight => HighlightStyles.Default(1);

const containerColor = computed(() =>
    isLightTheme.value ? 'rgba(250, 250, 250, 0.6)' : 'rgba(18, 18, 18, 0.4)'
);

const effects = (scope: BackdropEffectScope): void => {
    scope.vibrancy();
    scope.blur(dp(4));
    scope.lens(dp(16), dp(32));
};

function onDrawSurface(
    ctx: CanvasRenderingContext2D,
    size: { width: number; height: number }
): void {
    ctx.fillStyle = containerColor.value;
    ctx.fillRect(0, 0, size.width, size.height);
}
</script>

<template>
    <Transition name="glass-toast" appear :duration="200" @after-leave="emit('closed')">
        <div v-if="!closing" class="glass-toast">
            <GlassSurface
                content-class="glass-toast__row"
                :backdrop="RootBackdrop"
                :shape="Capsule"
                :effects="effects"
                :highlight="highlight"
                :on-draw-surface="onDrawSurface"
            >
                <component :is="icon" :size="18" :style="{ color: accent }" aria-hidden="true" />
                <span class="glass-toast__text">{{ text }}</span>
            </GlassSurface>
        </div>
    </Transition>
</template>

<style scoped>
/* 过渡类落在这层壳上，玻璃面是它的后代——淡出规则按后代选择器找 `.glass-surface`，
   类若加在玻璃面自己身上就落空了：缩放会动、淡出不会。 */
.glass-toast {
    display: inline-flex;
}

.glass-toast-enter-active,
.glass-toast-leave-active {
    transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.glass-toast-enter-from,
.glass-toast-leave-to {
    transform: scale(0.96);
}

.glass-toast-enter-active :deep(.glass-surface > *),
.glass-toast-leave-active :deep(.glass-surface > *) {
    transition: opacity 0.2s ease;
}

.glass-toast-enter-from :deep(.glass-surface > *),
.glass-toast-leave-to :deep(.glass-surface > *) {
    opacity: 0;
}

.glass-toast :deep(.glass-toast__row) {
    display: flex;
    align-items: center;
    gap: var(--ui-space-2);
    height: 44px;
    padding: 0 var(--ui-space-5);
    color: var(--ui-text-color);
}

.glass-toast :deep(.glass-toast__text) {
    font-size: 14px;
    white-space: nowrap;
}
</style>
