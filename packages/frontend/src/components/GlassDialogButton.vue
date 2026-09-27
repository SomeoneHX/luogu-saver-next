<script setup lang="ts">
/**
 * 玻璃对话框里的胶囊按钮，对应上游 `DialogContent` 的那两枚：
 * 次要键是半透明白（暗色下半透明黑），主键是实心主题色 + 白字，按压效果由 `RippleSurface` 提供。
 */
import { computed, inject } from 'vue';

import RippleSurface from '@/liquid-glass/components/RippleSurface.vue';
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

const emit = defineEmits<{ click: [] }>();

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

/** 上游：取消键的涟漪取当前模式的反色，强调键用白色。 */
const rippleColor = computed(() => {
    if (props.variant !== 'plain') return '#ffffff';
    return isLightTheme.value ? '#000000' : '#ffffff';
});

const inactive = computed(() => props.disabled || props.loading);

/** 涟漪宿主是 div，键盘路径要自己补上。 */
function onKeydown(event: KeyboardEvent): void {
    if (inactive.value || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    emit('click');
}
</script>

<template>
    <RippleSurface
        class="glass-dialog-button"
        :class="{ 'is-inactive': inactive }"
        :style="{ background, color }"
        :color="rippleColor"
        role="button"
        :tabindex="inactive ? -1 : 0"
        :aria-disabled="inactive"
        @click="emit('click')"
        @keydown="onKeydown"
    >
        <span v-if="loading" class="glass-dialog-button__spinner" aria-hidden="true"></span>
        <slot />
    </RippleSurface>
</template>

<style scoped>
.glass-dialog-button {
    display: flex;
    flex: 1 1 0;
    align-items: center;
    justify-content: center;
    height: 48px;
    font-size: 16px;
    border-radius: var(--ui-pill-radius);
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}

.glass-dialog-button :deep(.ripple-host__content) {
    display: inline-flex;
    align-items: center;
    gap: var(--ui-space-2);
}

.glass-dialog-button.is-inactive {
    opacity: 0.55;
    cursor: default;
    pointer-events: none;
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
