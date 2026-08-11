<script setup lang="ts">
import type { Component } from 'vue';
import { NIcon } from 'naive-ui';

withDefaults(
    defineProps<{
        title: string;
        icon?: Component | null;
    }>(),
    {
        icon: null
    }
);
</script>

<template>
    <header class="page-hero">
        <div v-if="icon" class="hero-symbol" aria-hidden="true">
            <n-icon class="hero-icon" :component="icon" size="34" />
        </div>
        <div class="hero-copy">
            <h1 class="hero-title">{{ title }}</h1>
            <p v-if="$slots.default" class="hero-subtitle"><slot /></p>
        </div>
    </header>
</template>

<style scoped>
.page-hero {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: var(--ui-space-5);
    padding: var(--ui-space-4) 0 var(--ui-space-2);
}

.hero-copy {
    min-width: 0;
}

.hero-symbol {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: var(--md-sys-shape-large);
    background: var(--ui-panel-color);
}

.hero-icon {
    flex: 0 0 auto;
    color: var(--ui-icon-color);
}

.hero-title {
    margin: 0;
    color: var(--ui-card-title-color);
    font-size: 32px;
    font-weight: 500;
    line-height: 1.2;
    letter-spacing: 0;
}

.hero-subtitle {
    margin: var(--ui-space-2) 0 0;
    color: var(--ui-secondary-text-color);
    font-size: 14px;
    line-height: 1.6;
    letter-spacing: 0;
}

@media (max-width: 480px) {
    .page-hero {
        grid-template-columns: auto minmax(0, 1fr);
        gap: var(--ui-space-3);
        padding: var(--ui-space-3) 0 0;
    }

    .hero-title {
        font-size: 24px;
    }

    .hero-symbol {
        width: 48px;
        height: 48px;
    }

    .hero-icon {
        font-size: 28px !important;
    }
}
</style>
