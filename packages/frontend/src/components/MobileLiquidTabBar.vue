<script setup lang="ts">
/**
 * Mobile bottom navigation, built on the ported AndroidLiquidGlass bottom tabs.
 *
 * Five fixed destinations — the sections that the sidebar exposes at the top level. Routes
 * that belong to none of them (an article, a user page, the admin area) keep whichever tab
 * was active, and fall back to the first one when the app is opened directly on such a URL.
 */
import { computed, inject, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Globe2, House, MessageCircleMore, Search, Settings } from 'lucide-vue-next';

import LiquidBottomTab from '@/liquid-glass/components/LiquidBottomTab.vue';
import LiquidBottomTabs from '@/liquid-glass/components/LiquidBottomTabs.vue';
import { RootBackdrop } from '@/liquid-glass/core/backdrop';
import { uiThemeKey } from '@/styles/theme/themeKeys.ts';
import { isLightColor } from '@/utils/ui-theme.ts';

const tabs = [
    { key: 'home', label: '主页', path: '/', icon: House },
    { key: 'search', label: '搜索', path: '/search', icon: Search },
    { key: 'rag', label: '问答', path: '/rag', icon: MessageCircleMore },
    { key: 'plaza', label: '广场', path: '/plaza', icon: Globe2 },
    { key: 'settings', label: '设置', path: '/settings', icon: Settings }
] as const;

const route = useRoute();
const router = useRouter();

const uiThemeVars = inject(uiThemeKey);

const isLightTheme = computed(() => isLightColor(uiThemeVars?.value.bodyColor ?? '#ffffff'));
const accentColor = computed(() => uiThemeVars?.value.primaryColor ?? '#2f6db5');

const selectedIndex = ref(tabIndexFor(route.meta.activeMenu));

watch(
    () => route.meta.activeMenu,
    activeMenu => {
        const index = tabIndexFor(activeMenu, -1);
        if (index >= 0) selectedIndex.value = index;
    }
);

function tabIndexFor(activeMenu: unknown, fallback = 0): number {
    const index = tabs.findIndex(tab => tab.key === activeMenu);
    return index >= 0 ? index : fallback;
}

function selectTab(index: number): void {
    const tab = tabs[index];
    if (!tab || route.path === tab.path) return;
    void router.push(tab.path);
}

/** Selected tab content is tinted with the app's primary colour, unselected stays black/white. */
function tabColor(index: number): string {
    if (index === selectedIndex.value) return accentColor.value;
    return isLightTheme.value ? '#000' : '#fff';
}
</script>

<template>
    <div class="liquid-tab-bar">
        <LiquidBottomTabs
            :selected-index="selectedIndex"
            :tabs-count="tabs.length"
            :is-light-theme="isLightTheme"
            :backdrop="RootBackdrop"
            @select="selectTab"
        >
            <template #tabs>
                <LiquidBottomTab
                    v-for="(tab, index) in tabs"
                    :key="tab.key"
                    :selected="index === selectedIndex"
                    :style="{ color: tabColor(index) }"
                    @click="selectTab(index)"
                >
                    <span class="liquid-tab-bar__icon">
                        <component :is="tab.icon" :size="26" />
                    </span>
                    <span class="liquid-tab-bar__label">{{ tab.label }}</span>
                </LiquidBottomTab>
            </template>
        </LiquidBottomTabs>
    </div>
</template>

<style scoped>
.liquid-tab-bar {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1100;
    padding: 0 var(--ui-space-4) calc(var(--ui-space-2) + env(safe-area-inset-bottom));
    /* Only the capsule is interactive; the gutter around it stays transparent to taps. */
    pointer-events: none;
}

.liquid-tab-bar :deep(.liquid-bottom-tabs) {
    pointer-events: auto;
}

.liquid-tab-bar__icon {
    display: block;
    width: 28px;
    height: 28px;
}

.liquid-tab-bar__label {
    font-size: 11px;
    line-height: 1;
}

.liquid-tab-bar__icon,
.liquid-tab-bar__label {
    transition: color 0.2s ease;
}
</style>
