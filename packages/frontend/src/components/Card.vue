<script setup lang="ts">
import { type CSSProperties, inject, computed, type Component, useSlots, type Ref } from 'vue';
import { NIcon } from 'naive-ui';
import { uiThemeKey, type UiThemeVars } from '@/styles/theme/themeKeys.ts';

const themeVars: Ref<UiThemeVars> = inject(uiThemeKey)!;
const slots = useSlots();

const props = defineProps({
    title: {
        type: String,
        default: null
    },
    icon: {
        type: Object as () => Component,
        default: null
    },
    iconColor: {
        type: String,
        default: null
    },
    backgroundColor: {
        type: String,
        default: null
    },
    hoverable: {
        type: Boolean,
        default: false
    },
    titleHtml: {
        type: String,
        default: null
    }
});

const emit = defineEmits<{
    click: [event: MouseEvent];
}>();

const effectiveIconColor = computed(() => {
    return props.iconColor || themeVars.value.primaryColor;
});

const effectiveBackgroundColor = computed(() => {
    return props.backgroundColor || themeVars.value.cardColor;
});

const cardStyle = computed(
    (): CSSProperties => ({
        backgroundColor: effectiveBackgroundColor.value,
        boxShadow: themeVars.value.cardShadow,
        borderRadius: themeVars.value.cardRadius
    })
);

const showHeader = computed(() => {
    return !!props.title || !!props.titleHtml || !!slots['header-extra'];
});
</script>

<template>
    <div
        class="saver-card"
        :class="{ 'is-hoverable': hoverable }"
        :style="cardStyle"
        @click="event => emit('click', event)"
    >
        <div v-if="showHeader" class="card-header">
            <div class="card-title-wrapper">
                <n-icon
                    v-if="icon"
                    :component="icon"
                    :color="effectiveIconColor"
                    size="24"
                    :depth="1"
                />
                <span
                    v-if="titleHtml"
                    class="card-title"
                    :style="{ color: themeVars.cardTitleColor }"
                    v-html="titleHtml"
                />
                <span
                    v-else-if="title"
                    class="card-title"
                    :style="{ color: themeVars.cardTitleColor }"
                >
                    {{ title }}
                </span>
                <slot name="title-extra" />
            </div>
            <div class="card-extra">
                <slot name="header-extra" />
            </div>
        </div>
        <div class="card-content">
            <slot />
        </div>
    </div>
</template>

<style scoped>
.saver-card {
    padding: var(--ui-card-padding);
    overflow: hidden;
    border: 0;
    transition:
        background-color 200ms var(--md-sys-motion-standard),
        box-shadow 200ms var(--md-sys-motion-standard),
        transform 120ms var(--md-sys-motion-standard);
    display: flex;
    flex-direction: column;
}

.saver-card.is-hoverable:hover {
    box-shadow: var(--ui-elevated-shadow) !important;
}

.saver-card.is-hoverable:active {
    transform: scale(0.995);
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--ui-space-4);
}

.card-title-wrapper {
    display: flex;
    align-items: center;
    gap: var(--ui-control-gap);
}

.card-title-wrapper > .n-icon {
    width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--ui-pill-radius);
    background: var(--ui-mark-background-color);
}

.card-title {
    font-weight: 500;
    font-size: 20px;
    line-height: 1.3;
}

.card-content {
    flex: 1;
}

:deep(mark) {
    padding: 0 2px;
    border-radius: var(--md-sys-shape-extra-small);
    background: var(--ui-panel-color);
    color: inherit;
}
</style>
