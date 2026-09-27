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

const emit = defineEmits<{
    'update:show': [value: boolean];
    /** 离场动画放完，宿主可以真正把这条删掉了。 */
    closed: [];
}>();

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
        <!-- `appear`：命令式对话框是挂载时就已经在显示，不加它首次渲染不会播进场。 -->
        <Transition name="glass-dialog" appear @after-leave="emit('closed')">
            <div v-if="show" class="glass-dialog" @click.self="onScrimClick">
                <div class="glass-dialog__scrim" :style="{ background: dimColor }"></div>

                <div
                    class="glass-dialog__panel"
                    role="dialog"
                    aria-modal="true"
                    :aria-label="title"
                >
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
        </Transition>
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

/*
 * 进场从放大一档收进来，离场再放大一档淡出去，两端共用同一个缩放值。缩放只加在卡片上：
 * 压暗层是全屏的，跟着缩放会在边缘露出没盖住的页面。
 */
.glass-dialog-enter-active,
.glass-dialog-leave-active {
    transition: opacity 0.2s ease;
}

.glass-dialog-enter-from,
.glass-dialog-leave-to {
    opacity: 0;
}

.glass-dialog-enter-active .glass-dialog__panel,
.glass-dialog-leave-active .glass-dialog__panel {
    transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1);
    will-change: transform;
}

.glass-dialog-enter-from .glass-dialog__panel,
.glass-dialog-leave-to .glass-dialog__panel {
    transform: scale(1.06);
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
    padding: 24px 28px 12px 28px;
    font-size: 24px;
    font-weight: 500;
}

.glass-dialog__body {
    min-height: 0;
    padding: 12px 24px;
    overflow-y: auto;
}

/* 没有标题 / 没有按钮行时，由内容自己把上下留白补上。 */
.glass-dialog__body.is-titleless {
    padding-top: 24px;
}

.glass-dialog__body.is-footerless {
    padding-bottom: 24px;
}

.glass-dialog__actions {
    display: flex;
    flex: none;
    align-items: center;
    gap: var(--ui-space-4);
    padding: 12px 24px 24px 24px;
}
</style>
