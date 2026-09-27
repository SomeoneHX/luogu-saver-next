<script setup lang="ts">
/**
 * 居中漂浮的玻璃对话框：整页压暗，上面一块圆角玻璃卡片。
 *
 * 压暗层画在玻璃面之前，所以它会进入玻璃采样的背景 —— 卡片采到的是压暗后的页面，与上游
 * Compose 版一致（上游的 dim 也是录进 backdrop 的）。
 */
import { computed, inject, onBeforeUnmount, onMounted } from 'vue';

import GlassSurface from '@/liquid-glass/components/GlassSurface.vue';
import type { BackdropEffectScope, Highlight } from '@/liquid-glass/core/backdrop';
import { HighlightStyles, RootBackdrop } from '@/liquid-glass/core/backdrop';
import { dp } from '@/liquid-glass/core/geometry';
import { RoundedRectangle } from '@/liquid-glass/core/shapes';
import { uiThemeKey } from '@/styles/theme/themeKeys.ts';
import { isLightColor } from '@/utils/ui-theme.ts';

/** 上游 `DialogContent` 的 `RoundedRectangle(dp(48))`。 */
const DIALOG_RADIUS = 48;

const props = withDefaults(
    defineProps<{
        show: boolean;
        title?: string;
        maskClosable?: boolean;
        closeOnEsc?: boolean;
    }>(),
    { title: '', maskClosable: true, closeOnEsc: true }
);

const emit = defineEmits<{ 'update:show': [value: boolean] }>();

const uiThemeVars = inject(uiThemeKey);
const isLightTheme = computed(() => isLightColor(uiThemeVars?.value.bodyColor ?? '#ffffff'));

const shape = RoundedRectangle(DIALOG_RADIUS);

/** 上游的 dim 与卡片底色，亮暗两套数值照抄（`DialogContent.vue:22-29`）。 */
const dimColor = computed(() =>
    isLightTheme.value ? 'rgba(41, 41, 58, 0.23)' : 'rgba(18, 18, 18, 0.56)'
);
const containerColor = computed(() =>
    isLightTheme.value ? 'rgba(250, 250, 250, 0.6)' : 'rgba(18, 18, 18, 0.4)'
);

const highlight = (): Highlight => HighlightStyles.Plain(1);

const effects = (scope: BackdropEffectScope): void => {
    scope.colorControls(isLightTheme.value ? 0.2 : 0, 1, 1.5);
    scope.blur(dp(isLightTheme.value ? 16 : 8));
    scope.lens(dp(24), dp(48), true);
};

function onDrawSurface(
    ctx: CanvasRenderingContext2D,
    size: { width: number; height: number }
): void {
    ctx.fillStyle = containerColor.value;
    ctx.fillRect(0, 0, size.width, size.height);
}

function onScrimClick(): void {
    if (props.maskClosable) emit('update:show', false);
}

function onKeydown(event: KeyboardEvent): void {
    if (!props.show || !props.closeOnEsc || event.key !== 'Escape') return;
    event.stopPropagation();
    emit('update:show', false);
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
    <Teleport to="body">
        <div v-if="show" class="glass-dialog" @click.self="onScrimClick">
            <div class="glass-dialog__scrim" :style="{ background: dimColor }"></div>

            <div class="glass-dialog__panel" role="dialog" aria-modal="true" :aria-label="title">
                <GlassSurface
                    class="glass-dialog__surface"
                    :backdrop="RootBackdrop"
                    :shape="shape"
                    :effects="effects"
                    :highlight="highlight"
                    :on-draw-surface="onDrawSurface"
                />

                <div class="glass-dialog__content">
                    <h2 v-if="title" class="glass-dialog__title">{{ title }}</h2>
                    <div
                        class="glass-dialog__body"
                        :class="{
                            'is-titleless': !title,
                            'is-footerless': !$slots.footer
                        }"
                    >
                        <slot />
                    </div>
                    <div v-if="$slots.footer" class="glass-dialog__actions">
                        <slot name="footer" />
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.glass-dialog {
    position: fixed;
    inset: 0;
    z-index: 1700;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--ui-space-4);
}

.glass-dialog__scrim {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

/* 不写 overflow 与 border-radius：圆角由形状画，圆角裁切的祖先会让玻璃采不到背景。 */
.glass-dialog__panel {
    position: relative;
    display: flex;
    flex-direction: column;
    width: min(520px, 100%);
    max-height: calc(100vh - var(--ui-space-8));
}

.glass-dialog__surface {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
}

/* 与玻璃面平级：玻璃面 content 层带形状的 clip-path，内容放进去会被裁。 */
.glass-dialog__content {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 0;
    color: var(--ui-text-color);
}

.glass-dialog__title {
    margin: 0;
    padding: var(--ui-space-6) var(--ui-space-6) var(--ui-space-3);
    font-size: 20px;
    font-weight: 600;
}

.glass-dialog__body {
    min-height: 0;
    padding: 0 var(--ui-space-6);
    overflow-y: auto;
}

/* 没有标题 / 没有按钮行时，由内容自己把上下留白补上。 */
.glass-dialog__body.is-titleless {
    padding-top: var(--ui-space-6);
}

.glass-dialog__body.is-footerless {
    padding-bottom: var(--ui-space-6);
}

.glass-dialog__actions {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: flex-end;
    gap: var(--ui-space-3);
    padding: var(--ui-space-5) var(--ui-space-6);
}
</style>
