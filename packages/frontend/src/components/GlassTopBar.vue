<script setup lang="ts">
/**
 * Mobile top bar for the destinations the bottom bar does not cover: a back button plus the route
 * title, on a glass that blurs whatever slides underneath and fades the blur out at its lower edge.
 */
import { computed, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronLeft } from 'lucide-vue-next';

import GlassSurface from '@/liquid-glass/components/GlassSurface.vue';
import LiquidButton from '@/liquid-glass/components/LiquidButton.vue';
import RippleSurface from '@/liquid-glass/components/RippleSurface.vue';
import type { BackdropEffectScope } from '@/liquid-glass/core/backdrop';
import { RootBackdrop } from '@/liquid-glass/core/backdrop';
import { dp } from '@/liquid-glass/core/geometry';
import { Rectangle } from '@/liquid-glass/core/shapes';
import { uiThemeKey } from '@/styles/theme/themeKeys.ts';
import { isLightColor } from '@/utils/ui-theme.ts';

const route = useRoute();
const router = useRouter();

const uiThemeVars = inject(uiThemeKey);
const isLightTheme = computed(() => isLightColor(uiThemeVars?.value.bodyColor ?? '#ffffff'));

const title = computed(() => (route.meta.title as string | undefined) ?? '');

/** Painted behind the blur, under the same ramp as the mask (see `GlassSurface`). */
const tintColor = computed(() => (isLightTheme.value ? '#ffffff' : '#808080'));

const effects = (scope: BackdropEffectScope): void => {
    scope.vibrancy();
    scope.blur(dp(8));
    // Recorded as `AlphaMask`; `GlassSurface` turns it into the mask ramp plus the tint below.
    scope.runtimeShaderEffect('AlphaMask', undefined, 'content', uniforms => {
        uniforms.setColorUniform('tint', tintColor.value);
        uniforms.setFloatUniform('tintIntensity', 0.72);
    });
};

/** Back to the previous entry, or home when this page was opened directly. */
function goBack(): void {
    if (window.history.state?.back) router.back();
    else void router.push('/');
}

/** The glass button is a div, so it takes the keys a button would. */
function onBackKeydown(event: KeyboardEvent): void {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    goBack();
}
</script>

<template>
    <div class="glass-top-bar" role="banner">
        <GlassSurface
            class="glass-top-bar__surface"
            :backdrop="RootBackdrop"
            :shape="Rectangle"
            :effects="effects"
            :highlight="() => null"
            :shadow="() => null"
        />

        <div class="glass-top-bar__row">
            <div
                class="glass-top-bar__back"
                role="button"
                aria-label="返回"
                tabindex="0"
                @click="goBack"
                @keydown="onBackKeydown"
            >
                <RippleSurface
                    class="glass-top-bar__back-ripple"
                    color="currentColor"
                    :alpha="0.18"
                >
                    <LiquidButton :backdrop="RootBackdrop">
                        <ChevronLeft :size="20" aria-hidden="true" />
                    </LiquidButton>
                </RippleSurface>
            </div>
            <span class="glass-top-bar__title">{{ title }}</span>
        </div>
    </div>
</template>

<style scoped>
.glass-top-bar {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 1050;
    /* Room below the bar for the ramp to fade out in. */
    --glass-top-bar-fade: 40px;

    /* Only the button takes pointers; the bar itself must not block the page. */
    pointer-events: none;
}

.glass-top-bar__surface {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: calc(var(--ui-mobile-top-bar-height) + var(--glass-top-bar-fade));
}

/* Laid over the surface instead of inside it: a clipped ancestor stops a nested glass from
   sampling the page, which is why the bottom-tabs indicator is a sibling too. */
.glass-top-bar__row {
    position: relative;
    display: grid;
    grid-template-columns: 36px 1fr 36px;
    align-items: center;
    height: var(--ui-mobile-top-bar-height);
    padding: 0 var(--ui-space-2);
    padding-top: env(safe-area-inset-top);
    color: var(--ui-text-color);
}

.glass-top-bar__back {
    display: flex;
    grid-column: 1;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    cursor: pointer;
    outline: none;
    pointer-events: auto;
    -webkit-tap-highlight-color: transparent;
}

.glass-top-bar__back:focus-visible {
    border-radius: var(--ui-pill-radius);
    box-shadow: var(--ui-focus-ring-shadow);
}

/* The ripple host is the 36px disc; `LiquidButton` brings its own 48px height and 16px of
   content padding and is stretched into it. */
.glass-top-bar__back-ripple {
    width: 36px;
    height: 36px;
    border-radius: var(--ui-pill-radius);
}

.glass-top-bar__back-ripple :deep(.ripple-host__content) {
    width: 100%;
    height: 100%;
}

.glass-top-bar__back :deep(.liquid-button) {
    width: 100% !important;
    height: 100% !important;
}

.glass-top-bar__back :deep(.liquid-button__content) {
    padding: 0 !important;
}

.glass-top-bar__title {
    grid-column: 2;
    overflow: hidden;
    font-size: 16px;
    font-weight: 600;
    text-align: center;
    white-space: nowrap;
    text-overflow: ellipsis;
}
</style>
