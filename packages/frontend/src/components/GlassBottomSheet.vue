<script setup lang="ts">
/**
 * A glass slab that slides up from the bottom edge. Teleported to the body so no ancestor can
 * clip it: a rounded clipped ancestor makes Chromium skip the SVG-filter half of
 * `backdrop-filter`, and the surface then paints no backdrop at all.
 *
 * The grip at the top dismisses the sheet either by distance or by the speed of the throw.
 */
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';

import GlassSurface from '@/liquid-glass/components/GlassSurface.vue';
import type { BackdropEffectScope } from '@/liquid-glass/core/backdrop';
import { RootBackdrop } from '@/liquid-glass/core/backdrop';
import { dp } from '@/liquid-glass/core/geometry';
import { RoundedRectangle } from '@/liquid-glass/core/shapes';
import { VelocityTracker } from '@/liquid-glass/core/velocity-tracker';

const PANEL_RADIUS = 28;
/** Fraction of the panel height a drag has to cover to dismiss on release. */
const DISMISS_DISTANCE_RATIO = 0.35;
/** px/ms — a throw faster than this dismisses the sheet whatever the distance. */
const DISMISS_VELOCITY = 0.5;
/** Kept in step with the panel's transition so the sheet is gone once it has slid away. */
const SLIDE_DURATION = 340;

const props = withDefaults(defineProps<{ show: boolean; title?: string }>(), { title: '' });

const emit = defineEmits<{ 'update:show': [value: boolean] }>();

const shape = RoundedRectangle(PANEL_RADIUS);
const panelEl = ref<HTMLElement | null>(null);
const translateY = ref('110%');
const dragging = ref(false);
const tracker = new VelocityTracker();

let startY = 0;
let activePointer: number | null = null;
let slideTimer: number | null = null;

const noHighlight = () => null;

const effects = (scope: BackdropEffectScope): void => {
    scope.vibrancy();
    scope.blur(dp(16));
    scope.lens(dp(24), dp(48));
};

function clearSlideTimer(): void {
    if (slideTimer === null) return;
    window.clearTimeout(slideTimer);
    slideTimer = null;
}

/** Slides the panel out of the way, then reports the sheet as closed. */
function requestClose(): void {
    if (!props.show || slideTimer !== null) return;
    translateY.value = '110%';
    slideTimer = window.setTimeout(() => {
        slideTimer = null;
        emit('update:show', false);
    }, SLIDE_DURATION);
}

function onGripDown(event: PointerEvent): void {
    clearSlideTimer();
    dragging.value = true;
    startY = event.clientY;
    activePointer = event.pointerId;
    try {
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    } catch {
        // Synthetic pointers have no capture target; the moves still arrive on the grip.
    }
    tracker.resetTracking();
    tracker.addPosition(performance.now(), { x: 0, y: 0 });
}

function onGripMove(event: PointerEvent): void {
    if (!dragging.value || event.pointerId !== activePointer) return;
    const offset = Math.max(0, event.clientY - startY);
    translateY.value = `${offset}px`;
    tracker.addPosition(performance.now(), { x: 0, y: offset });
}

function onGripUp(event: PointerEvent): void {
    if (!dragging.value || event.pointerId !== activePointer) return;
    dragging.value = false;
    activePointer = null;
    const velocity = tracker.calculateVelocity().y;
    tracker.resetTracking();
    const height = panelEl.value?.offsetHeight ?? 0;
    const travelled = Number.parseFloat(translateY.value) || 0;
    if (velocity > DISMISS_VELOCITY || travelled > height * DISMISS_DISTANCE_RATIO) {
        requestClose();
        return;
    }
    translateY.value = '0px';
}

function onGripKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    requestClose();
}

watch(
    () => props.show,
    async value => {
        clearSlideTimer();
        if (!value) {
            translateY.value = '110%';
            return;
        }
        // Reset to the off-screen position, then move on the next frame so the transition runs.
        dragging.value = true;
        translateY.value = '110%';
        await nextTick();
        requestAnimationFrame(() => {
            dragging.value = false;
            translateY.value = '0px';
        });
    },
    { immediate: true }
);

onBeforeUnmount(clearSlideTimer);
</script>

<template>
    <Teleport to="body">
        <div v-if="show" class="glass-sheet" @click.self="requestClose">
            <div
                ref="panelEl"
                class="glass-sheet__panel"
                :class="{ 'is-dragging': dragging }"
                :style="{ transform: `translateY(${translateY})` }"
                role="dialog"
                aria-modal="true"
                :aria-label="title"
            >
                <GlassSurface
                    class="glass-sheet__surface"
                    :backdrop="RootBackdrop"
                    :shape="shape"
                    :effects="effects"
                    :highlight="noHighlight"
                />

                <div class="glass-sheet__foreground">
                    <div
                        class="glass-sheet__grip"
                        role="button"
                        tabindex="0"
                        aria-label="下拉关闭"
                        @pointerdown="onGripDown"
                        @pointermove="onGripMove"
                        @pointerup="onGripUp"
                        @pointercancel="onGripUp"
                        @keydown="onGripKeydown"
                    >
                        <span class="glass-sheet__grip-bar" aria-hidden="true"></span>
                    </div>

                    <h2 v-if="title" class="glass-sheet__title">{{ title }}</h2>

                    <div class="glass-sheet__body">
                        <slot />
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.glass-sheet {
    position: fixed;
    inset: 0;
    z-index: 1300;
}

/*
 * No `overflow: hidden` and no `border-radius` here on purpose — the rounded outline is drawn by
 * the glass surface, and a rounded clip on an ancestor is what makes the surface stop sampling.
 */
.glass-sheet__panel {
    position: absolute;
    right: var(--ui-space-3);
    bottom: calc(var(--ui-space-3) + env(safe-area-inset-bottom));
    left: var(--ui-space-3);
    height: min(76vh, 640px);
    transition: transform 0.34s cubic-bezier(0.32, 0.72, 0, 1);
    will-change: transform;
}

.glass-sheet__panel.is-dragging {
    transition: none;
}

.glass-sheet__surface {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
}

/* Sibling of the surface, never a child of its content layer: that layer carries the shape's
 * clip-path, and a clipped ancestor cuts off a nested glass. */
.glass-sheet__foreground {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    color: var(--ui-text-color);
}

.glass-sheet__grip {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    height: 28px;
    cursor: grab;
    /* Without this the drag is swallowed by the page's scroll gesture. */
    touch-action: none;
}

.glass-sheet__grip:active {
    cursor: grabbing;
}

.glass-sheet__grip-bar {
    width: 40px;
    height: 4px;
    background: currentColor;
    border-radius: var(--ui-pill-radius);
    opacity: 0.24;
}

.glass-sheet__title {
    flex: none;
    margin: 0 0 var(--ui-space-3);
    padding: 0 var(--ui-space-5);
    font-size: 17px;
    font-weight: 600;
}

.glass-sheet__body {
    flex: 1;
    min-height: 0;
    padding: 0 var(--ui-space-5) var(--ui-space-5);
    overflow-y: auto;
    overscroll-behavior: contain;
}
</style>
