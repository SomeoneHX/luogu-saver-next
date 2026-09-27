<script setup lang="ts">
/**
 * 搜索框：一枚玻璃胶囊。
 *
 * 两种高光都落在玻璃面上——边缘那圈由 `HighlightStyles.Default` 画，跟随指针的径向光晕由
 * `InteractiveHighlight` 画。输入框与图标都不带底色，光晕才透得出来。
 *
 * 指针跟踪接在玻璃面自身（`attach` 会给它 `touch-action: none` 并在按下时捕获指针，事件仍会
 * 照常送到输入框，但在这块区域内拖拽不再滚动页面）。
 */
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue';
import { ArrowRight, Search } from 'lucide-vue-next';

import GlassSurface from '@/liquid-glass/components/GlassSurface.vue';
import type { BackdropEffectScope, Highlight } from '@/liquid-glass/core/backdrop';
import { HighlightStyles, RootBackdrop } from '@/liquid-glass/core/backdrop';
import { dp } from '@/liquid-glass/core/geometry';
import { InteractiveHighlight } from '@/liquid-glass/core/interactive-highlight';
import { Capsule } from '@/liquid-glass/core/shapes';
import { uiThemeKey } from '@/styles/theme/themeKeys.ts';
import { isLightColor } from '@/utils/ui-theme.ts';

withDefaults(defineProps<{ modelValue: string; placeholder?: string }>(), {
    placeholder: '搜索'
});

const emit = defineEmits<{ 'update:modelValue': [value: string]; submit: [] }>();

const surface = ref<InstanceType<typeof GlassSurface> | null>(null);

const uiThemeVars = inject(uiThemeKey);
const isLightTheme = computed(() => isLightColor(uiThemeVars?.value.bodyColor ?? '#ffffff'));

const interactiveHighlight = new InteractiveHighlight();

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

let detachHighlight: (() => void) | null = null;

onMounted(() => {
    const element = surface.value?.el as HTMLElement | null | undefined;
    if (element) detachHighlight = interactiveHighlight.attach(element);
});

onBeforeUnmount(() => {
    detachHighlight?.();
    detachHighlight = null;
});

function onInput(event: Event): void {
    emit('update:modelValue', (event.target as HTMLInputElement).value);
}
</script>

<template>
    <GlassSurface
        ref="surface"
        class="glass-search"
        content-class="glass-search__row"
        :backdrop="RootBackdrop"
        :shape="Capsule"
        :effects="effects"
        :highlight="highlight"
        :on-draw-surface="onDrawSurface"
        :interactive-highlight="interactiveHighlight"
    >
        <Search :size="20" class="glass-search__icon" aria-hidden="true" />
        <input
            class="glass-search__input"
            type="text"
            :value="modelValue"
            :placeholder="placeholder"
            aria-label="搜索"
            @input="onInput"
            @keydown.enter="emit('submit')"
        />
        <button type="button" class="glass-search__go" aria-label="搜索" @click="emit('submit')">
            <ArrowRight :size="18" aria-hidden="true" />
        </button>
    </GlassSurface>
</template>

<style scoped>
.glass-search {
    width: min(100%, 720px);
}

.glass-search :deep(.glass-search__row) {
    display: flex;
    align-items: center;
    gap: var(--ui-space-3);
    box-sizing: border-box;
    width: 100%;
    height: 54px;
    padding: 0 var(--ui-space-3) 0 var(--ui-space-5);
    color: var(--ui-text-color);
}

.glass-search__icon {
    flex: none;
    color: var(--ui-icon-color);
}

.glass-search__input {
    flex: 1;
    min-width: 0;
    height: 100%;
    font: inherit;
    font-size: 16px;
    color: inherit;
    background: transparent;
    border: 0;
    outline: none;
}

.glass-search__input::placeholder {
    color: var(--ui-control-placeholder-color);
}

.glass-search__go {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: #ffffff;
    background: var(--ui-primary-color);
    border: 0;
    border-radius: var(--ui-pill-radius);
    cursor: pointer;
}

.glass-search__go:hover {
    background: var(--ui-primary-color-hover);
}

@media (max-width: 480px) {
    .glass-search :deep(.glass-search__row) {
        height: 50px;
        padding-left: var(--ui-space-4);
    }
}
</style>
