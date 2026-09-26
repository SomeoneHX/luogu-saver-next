<script setup lang="ts">
import { ref } from 'vue';
import { Settings } from 'lucide-vue-next';

import GlassBottomSheet from '@/components/GlassBottomSheet.vue';
import ThemeEditorFields from '@/components/ThemeEditorFields.vue';
import LiquidButton from '@/liquid-glass/components/LiquidButton.vue';
import { RootBackdrop } from '@/liquid-glass/core/backdrop';

const show = ref(false);
</script>

<template>
    <LiquidButton
        :backdrop="RootBackdrop"
        class="app-floating-control theme-editor-trigger"
        aria-label="主题设置"
        @click="show = true"
    >
        <Settings :size="20" aria-hidden="true" />
    </LiquidButton>

    <GlassBottomSheet v-model:show="show" title="主题编辑器">
        <ThemeEditorFields />
    </GlassBottomSheet>
</template>

<style scoped>
.theme-editor-trigger {
    position: fixed;
    right: var(--ui-floating-control-inset);
    bottom: var(--ui-floating-control-inset);
    z-index: 1000;
}

@media (max-width: 768px) {
    .theme-editor-trigger {
        bottom: calc(var(--ui-mobile-tab-bar-height) + var(--ui-floating-control-gap));
    }
}
</style>
