<script setup lang="ts">
/**
 * The app's switch, drawn with the ported liquid glass toggle.
 *
 * `v-model:value` matches the naive-ui switch it replaces. The vendored toggle attaches its
 * gesture to the 40x24 thumb only, so taps and keys are handled here for the whole control.
 */
import { computed, inject } from 'vue';

import LiquidToggle from '@/liquid-glass/components/LiquidToggle.vue';
import { RootBackdrop } from '@/liquid-glass/core/backdrop';
import { uiThemeKey } from '@/styles/theme/themeKeys.ts';
import { isLightColor } from '@/utils/ui-theme.ts';

const props = defineProps<{ value: boolean }>();

const emit = defineEmits<{ 'update:value': [value: boolean] }>();

const uiThemeVars = inject(uiThemeKey);

const isLightTheme = computed(() => isLightColor(uiThemeVars?.value.bodyColor ?? '#ffffff'));

function toggle(): void {
    emit('update:value', !props.value);
}

function onTrackClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('.liquid-toggle__thumb')) return;
    toggle();
}

function onKeydown(event: KeyboardEvent): void {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    toggle();
}
</script>

<template>
    <div
        class="glass-switch"
        role="switch"
        :aria-checked="props.value"
        tabindex="0"
        @click="onTrackClick"
        @keydown="onKeydown"
    >
        <LiquidToggle
            :selected="props.value"
            :is-light-theme="isLightTheme"
            :backdrop="RootBackdrop"
            @select="emit('update:value', $event)"
        />
    </div>
</template>

<style scoped>
.glass-switch {
    display: inline-flex;
    flex: none;
    height: 28px;
    cursor: pointer;
    outline: none;
    -webkit-tap-highlight-color: transparent;
}

.glass-switch:focus-visible {
    border-radius: var(--ui-pill-radius);
    box-shadow: var(--ui-focus-ring-shadow);
}
</style>
