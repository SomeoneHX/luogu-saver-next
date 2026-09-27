<script setup lang="ts">
/**
 * 玻璃对话框里的胶囊按钮，对应上游 `DialogContent` 的取消 / 强调两种：
 * 取消是半透明白（暗色下为半透明黑），强调是主题强调色，文字白色。
 */
import { computed, inject } from 'vue';

import { uiThemeKey } from '@/styles/theme/themeKeys.ts';
import { isLightColor } from '@/utils/ui-theme.ts';

const props = withDefaults(
    defineProps<{
        variant?: 'accent' | 'plain' | 'danger' | 'success';
        loading?: boolean;
        disabled?: boolean;
    }>(),
    { variant: 'accent', loading: false, disabled: false }
);

const emit = defineEmits<{ click: [event: MouseEvent] }>();

const uiThemeVars = inject(uiThemeKey);
const isLightTheme = computed(() => isLightColor(uiThemeVars?.value.bodyColor ?? '#ffffff'));

const background = computed(() => {
    switch (props.variant) {
        case 'plain':
            return isLightTheme.value ? 'rgba(250, 250, 250, 0.12)' : 'rgba(18, 18, 18, 0.08)';
        case 'danger':
            return 'var(--ui-error-color)';
        case 'success':
            return 'var(--ui-success-color)';
        default:
            return 'var(--ui-primary-color)';
    }
});

const color = computed(() => (props.variant === 'plain' ? 'var(--ui-text-color)' : '#ffffff'));
</script>

<template>
    <button
        type="button"
        class="glass-dialog-button"
        :style="{ background, color }"
        :disabled="disabled || loading"
        @click="emit('click', $event)"
    >
        <span v-if="loading" class="glass-dialog-button__spinner" aria-hidden="true"></span>
        <slot />
    </button>
</template>

<style scoped>
.glass-dialog-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--ui-space-2);
    min-width: 88px;
    height: 44px;
    padding: 0 var(--ui-space-5);
    font: inherit;
    font-size: 15px;
    border: 0;
    border-radius: var(--ui-pill-radius);
    cursor: pointer;
}

.glass-dialog-button:disabled {
    cursor: default;
    opacity: 0.55;
}

.glass-dialog-button__spinner {
    width: 14px;
    height: 14px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: glass-dialog-button-spin 0.7s linear infinite;
}

@keyframes glass-dialog-button-spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
