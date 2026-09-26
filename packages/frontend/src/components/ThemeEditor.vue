<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, ref } from 'vue';
import { NDrawer, NDrawerContent } from 'naive-ui';
import { Settings } from 'lucide-vue-next';

import GlassBottomSheet from '@/components/GlassBottomSheet.vue';
import ThemeEditorFields from '@/components/ThemeEditorFields.vue';
import LiquidButton from '@/liquid-glass/components/LiquidButton.vue';
import RippleSurface from '@/liquid-glass/components/RippleSurface.vue';
import { RootBackdrop } from '@/liquid-glass/core/backdrop';
import { uiThemeKey } from '@/styles/theme/themeKeys.ts';

const uiTheme = inject(uiThemeKey);

if (!uiTheme) {
    throw new Error('ThemeEditor 必须在 provider 内部使用');
}

const show = ref(false);

const mobileViewport = window.matchMedia('(max-width: 768px)');
const isMobileViewport = ref(mobileViewport.matches);
const handleViewportChange = (event: MediaQueryListEvent) => {
    isMobileViewport.value = event.matches;
};

onMounted(() => {
    mobileViewport.addEventListener('change', handleViewportChange);
});

onBeforeUnmount(() => {
    mobileViewport.removeEventListener('change', handleViewportChange);
});
</script>

<template>
    <RippleSurface
        class="app-floating-control theme-editor-trigger"
        color="currentColor"
        :alpha="0.18"
    >
        <LiquidButton :backdrop="RootBackdrop" aria-label="主题设置" @click="show = true">
            <Settings :size="20" aria-hidden="true" />
        </LiquidButton>
    </RippleSurface>

    <GlassBottomSheet v-if="isMobileViewport" v-model:show="show" title="主题编辑器">
        <ThemeEditorFields />
    </GlassBottomSheet>

    <n-drawer
        v-else
        v-model:show="show"
        width="min(420px, 66.666vw)"
        placement="right"
        :theme-overrides="{
            color: uiTheme?.cardColor,
            borderRadius: uiTheme?.cardRadius,
            boxShadow: uiTheme?.cardShadow,
            titleTextColor: uiTheme?.cardTitleColor,
            textColor: uiTheme?.textColor
        }"
    >
        <n-drawer-content title="主题编辑器" :style="{ '--n-color': uiTheme?.cardColor }">
            <ThemeEditorFields />
        </n-drawer-content>
    </n-drawer>
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
