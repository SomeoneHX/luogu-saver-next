<!--suppress ALL -->
<template>
    <n-config-provider :theme-overrides="themeOverrides">
        <n-message-provider :theme-overrides="themeOverrides.Message">
            <n-space vertical>
                <n-layout
                    class="app-shell"
                    :class="{ 'has-mobile-top-bar': showMobileTopBar }"
                    :style="themeCssVars"
                    :data-ui-code-theme="uiThemeVars.codeTheme"
                >
                    <div
                        class="app-sider"
                        :class="{
                            'is-collapsed': collapsed,
                            'has-expand-animation': sidebarExpandAnimation
                        }"
                        @mouseenter="handleMouseEnter"
                        @mouseleave="handleMouseLeave"
                    >
                        <GlassSurface
                            class="app-sider__surface"
                            :backdrop="RootBackdrop"
                            :shape="sidebarShape"
                            :effects="sidebarEffects"
                            :highlight="sidebarHighlight"
                        />

                        <div class="app-sider__body">
                            <div
                                class="brand-shell"
                                :style="{ cursor: sidebarLogoNavEnabled ? 'pointer' : undefined }"
                                @click="
                                    sidebarLogoNavEnabled ? handleMenuSelect('home') : undefined
                                "
                            >
                                <n-icon class="brand-logo" :component="LuoguLogo" />
                                <span v-if="!collapsed" class="brand-text">洛谷保存站</span>
                            </div>

                            <div class="app-sider__menu">
                                <n-menu
                                    v-model:value="activeKey"
                                    :collapsed="collapsed"
                                    :collapsed-width="64"
                                    :collapsed-icon-size="24"
                                    :icon-size="24"
                                    :indent="20"
                                    :options="menuOptions"
                                    :responsive="true"
                                    :accordion="true"
                                    @update:value="handleMenuSelect"
                                />
                            </div>
                        </div>
                    </div>

                    <n-dialog-provider :theme-overrides="themeOverrides.Dialog">
                        <n-layout class="app-main" :native-scrollbar="false">
                            <n-layout-content content-style="padding: var(--ui-page-padding);">
                                <div class="router-view">
                                    <SiteNotificationCenter />
                                    <UserNotificationCenter />
                                    <n-back-top
                                        class="app-floating-control back-top-action"
                                        aria-label="返回顶部"
                                    >
                                        <LiquidButton :backdrop="RootBackdrop">
                                            <ArrowUp :size="22" aria-hidden="true" />
                                        </LiquidButton>
                                    </n-back-top>
                                    <router-view />
                                </div>
                                <n-layout-footer bordered class="app-footer">
                                    <n-grid class="footer-grid" cols="1 s:2" responsive="screen">
                                        <n-gi>
                                            <p class="footer-element">
                                                <a
                                                    href="https://github.com/laikit-dev/luogu-saver"
                                                    class="footer-link"
                                                >
                                                    <Github :size="14" />
                                                    <span> GitHub </span>
                                                </a>
                                                <a href="https://laikit.dev" class="footer-link">
                                                    <BookOpen :size="14" />
                                                    <span> 帮助文档 </span>
                                                </a>
                                                <a
                                                    href="https://github.com/laikit-dev/luogu-saver/graphs/contributors"
                                                    class="footer-link"
                                                >
                                                    <Users :size="14" />
                                                    <span> 项目贡献者 </span>
                                                </a>
                                            </p>
                                        </n-gi>
                                        <n-gi>
                                            <p class="footer-element right-aligned">
                                                <a
                                                    href="https://qm.qq.com/q/QVM9YFEb26"
                                                    target="_blank"
                                                    class="footer-link"
                                                >
                                                    <MessagesSquare :size="14" />
                                                    <span
                                                        >洛谷保存站用户群：1017248143（点击加入）</span
                                                    >
                                                </a>
                                            </p>
                                        </n-gi>
                                        <n-gi>
                                            <p class="footer-element">
                                                <Clock3 :size="14" />
                                                <span>
                                                    本网站已运行
                                                    {{ timeSinceFound }} 秒
                                                </span>
                                            </p>
                                        </n-gi>
                                        <n-gi>
                                            <p class="footer-element right-aligned">
                                                <a
                                                    href="https://www.rainyun.com/federico_?s=saver"
                                                    target="_blank"
                                                    class="footer-link"
                                                >
                                                    <Server :size="14" />
                                                    <span>本站由雨云提供支持</span>
                                                </a>
                                            </p>
                                        </n-gi>
                                        <n-gi class="footer-copyright">
                                            <p class="footer-element">
                                                <Copyright :size="14" />
                                                <span> 2025-2026 洛谷保存站 </span>
                                            </p>
                                        </n-gi>
                                        <n-gi class="footer-legal">
                                            <p class="footer-element right-aligned">
                                                <router-link to="/privacy" class="footer-link">
                                                    <ShieldUser :size="14" />
                                                    <span>隐私协议</span>
                                                </router-link>
                                                <router-link to="/disclaimer" class="footer-link">
                                                    <CircleAlert :size="14" />
                                                    <span>免责声明</span>
                                                </router-link>
                                                <router-link to="/deletion" class="footer-link">
                                                    <Trash2 :size="14" />
                                                    <span>数据移除政策</span>
                                                </router-link>
                                            </p>
                                        </n-gi>
                                    </n-grid>
                                </n-layout-footer>
                            </n-layout-content>
                        </n-layout>
                    </n-dialog-provider>
                    <MobileLiquidTabBar v-if="showMobileTabBar" />
                    <GlassTopBar v-if="showMobileTopBar" />
                    <StarPrompt :blocked="trackingConsentBlocking" />
                    <TrackingConsent @update:blocking="trackingConsentBlocking = $event" />
                </n-layout>
            </n-space>
        </n-message-provider>
    </n-config-provider>
</template>

<script setup lang="ts">
import { provide, ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
    NLayout,
    NLayoutContent,
    NLayoutFooter,
    NSpace,
    NMenu,
    NConfigProvider,
    type GlobalThemeOverrides,
    NGrid,
    NGi,
    type MenuOption,
    NMessageProvider,
    NBackTop,
    NDialogProvider,
    NIcon
} from 'naive-ui';

import {
    ArrowUp,
    BookOpen,
    ChartNoAxesColumnIncreasing,
    CircleAlert,
    Clock3,
    CloudDownload,
    Copyright,
    Globe2,
    Github,
    Hammer,
    House,
    LayoutGrid,
    MessageCircleMore,
    MessagesSquare,
    Search,
    Server,
    Settings,
    ShieldCheck,
    ShieldUser,
    Trash2,
    Users
} from 'lucide-vue-next';

import { renderIcon } from '@/utils/render';

import {
    uiThemeKey,
    uiThemeModeKey,
    uiThemePresetKey,
    type UiThemeMode,
    type UiThemePresetName,
    type UiThemeVars
} from '@/styles/theme/themeKeys.ts';
import { presets } from '@/styles/theme/presets.ts';
import TrackingConsent from '@/components/TrackingConsent.vue';
import StarPrompt from '@/components/StarPrompt.vue';
import MobileLiquidTabBar from '@/components/MobileLiquidTabBar.vue';
import GlassTopBar from '@/components/GlassTopBar.vue';
import GlassSurface from '@/liquid-glass/components/GlassSurface.vue';
import LiquidButton from '@/liquid-glass/components/LiquidButton.vue';
import type { BackdropEffectScope, Highlight } from '@/liquid-glass/core/backdrop';
import { HighlightStyles, RootBackdrop } from '@/liquid-glass/core/backdrop';
import { dp } from '@/liquid-glass/core/geometry';
import { RoundedRectangle } from '@/liquid-glass/core/shapes';
import LuoguLogo from '@/components/icons/LuoguLogo.vue';
import SiteNotificationCenter from '@/components/SiteNotificationCenter.vue';
import UserNotificationCenter from '@/components/UserNotificationCenter.vue';
import { currentRole, isAuthenticated, setCurrentAuth } from '@/utils/auth.ts';
import { hasAnyPermission, Permission, ROLE_ADMIN } from '@/utils/permissions.ts';
import { getCurrentUser } from '@/api/auth.ts';

// import socket from '@/utils/websocket';

// socket.joinRoom('notification');

const router = useRouter();
const route = useRoute();

const SIDEBAR_RADIUS = 24;

const activeKey = computed(
    () => (route.meta.activeMenu as string) || (route.path as string).slice(1)
);
const collapsed = ref(true);
const trackingConsentBlocking = ref(true);
const sidebarLogoNavEnabled = useLocalStorage(SIDEBAR_LOGO_NAV_STORAGE_KEY, true);
const sidebarExpandAnimation = useLocalStorage(SIDEBAR_EXPAND_ANIMATION_STORAGE_KEY, false);
provide('sidebarLogoNavEnabled', sidebarLogoNavEnabled);
provide('sidebarExpandAnimation', sidebarExpandAnimation);

const sidebarShape = RoundedRectangle(SIDEBAR_RADIUS);

const sidebarHighlight = (): Highlight => HighlightStyles.Plain(1);

const sidebarEffects = (scope: BackdropEffectScope): void => {
    scope.vibrancy();
    scope.blur(dp(4));
    scope.lens(dp(24), dp(48));
};

const isMobileViewport = () => window.innerWidth <= 768;

/** 悬停展开、移开收起。宽度是否过渡由设置里的开关决定，默认直接切换。 */
const handleMouseEnter = () => {
    if (isMobileViewport()) return;
    collapsed.value = false;
};

const handleMouseLeave = () => {
    if (isMobileViewport()) return;
    collapsed.value = true;
};

const mobileViewportMedia = window.matchMedia('(max-width: 768px)');
const showMobileTabBar = ref(mobileViewportMedia.matches);

mobileViewportMedia.addEventListener('change', event => {
    showMobileTabBar.value = event.matches;
});

/** 顶栏只出现在底栏覆盖不到的路由上。 */
const showMobileTopBar = computed(
    () => showMobileTabBar.value && !MOBILE_TAB_KEYS.includes(String(route.meta.activeMenu ?? ''))
);

const canShowAdminMenu = computed(() =>
    hasAnyPermission(currentRole.value, [
        Permission.MANAGE_USERS,
        Permission.MANAGE_SEARCH,
        Permission.MANAGE_ANNOUNCEMENTS,
        Permission.MANAGE_DISCOVERY,
        Permission.MANAGE_CONTENT
    ])
);

const canShowDiscoveryMenu = computed(() => currentRole.value === ROLE_ADMIN);

const menuOptions = computed<MenuOption[]>(() => [
    {
        label: '主页',
        key: 'home',
        icon: renderIcon(House)
    },
    {
        label: '搜索',
        key: 'search',
        icon: renderIcon(Search)
    },
    {
        label: 'RAG 问答',
        key: 'rag',
        icon: renderIcon(MessageCircleMore)
    },
    // {
    //     label: '题目',
    //     key: 'problem',
    //     icon: renderIcon(List)
    // },
    {
        label: '文章广场',
        key: 'plaza',
        icon: renderIcon(Globe2)
    },
    ...(canShowDiscoveryMenu.value
        ? [
              {
                  label: '用户文章爬取',
                  key: 'discovery/user-articles',
                  icon: renderIcon(CloudDownload)
              }
          ]
        : []),
    {
        label: '犇犇保存站',
        key: 'benben',
        icon: renderIcon(MessagesSquare)
    },
    // {
    //     label: '冬日绘板',
    //     key: 'paintboard',
    //     icon: renderIcon(BrushOutline),
    //     children: [
    //         {
    //             label: '查看绘板',
    //             key: 'paintboard/view',
    //             icon: renderIcon(ImageOutline)
    //         },
    //         {
    //             label: '申请凭据',
    //             key: 'paintboard/token',
    //             icon: renderIcon(KeyRound)
    //         }
    //     ]
    // },
    {
        label: '陶片放逐',
        key: 'judgement',
        icon: renderIcon(Hammer)
    },
    {
        label: '统计数据',
        key: 'statistic',
        icon: renderIcon(ChartNoAxesColumnIncreasing)
    },
    {
        label: '关于',
        key: 'about',
        icon: renderIcon(LayoutGrid)
    },
    {
        label: '设置',
        key: 'settings',
        icon: renderIcon(Settings)
    },
    ...(canShowAdminMenu.value
        ? [
              {
                  label: '后台',
                  key: 'admin',
                  icon: renderIcon(ShieldCheck)
              }
          ]
        : [])
]);

import {
    THEME_MODE_STORAGE_KEY,
    THEME_PRESET_STORAGE_KEY,
    THEME_STORAGE_KEY,
    SIDEBAR_LOGO_NAV_STORAGE_KEY,
    SIDEBAR_EXPAND_ANIMATION_STORAGE_KEY,
    MOBILE_TAB_KEYS
} from '@/utils/constants.ts';
import { useLocalStorage } from '@/composables/useLocalStorage.ts';

type StoredUiThemeVars = Partial<UiThemeVars> & { codeRenderFilter?: string };

const normalizeThemeMode = (storedMode: UiThemeMode | null): UiThemeMode => {
    if (storedMode === 'auto' || storedMode === 'light' || storedMode === 'dark') {
        return storedMode;
    }
    if (storedMode === 'manual') return 'light';
    return 'auto';
};

const normalizePresetName = (storedPreset: UiThemePresetName | null): UiThemePresetName =>
    storedPreset && presets[storedPreset] ? storedPreset : 'default';

const resolveThemeBase = (presetName: UiThemePresetName, mode: UiThemeMode): UiThemeVars => {
    const preset = presets[presetName];
    if (mode === 'dark') return { ...preset.dark };
    if (mode === 'light') return { ...preset.light };
    const isDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return isDark ? { ...preset.dark } : { ...preset.light };
};

const applyUserOverrides = (base: UiThemeVars, stored: StoredUiThemeVars | null): UiThemeVars => {
    if (!stored) return base;
    const cleaned = { ...stored };
    delete (cleaned as any).codeRenderFilter;
    return { ...base, ...cleaned };
};

const themePresetStorage = useLocalStorage<UiThemePresetName>(THEME_PRESET_STORAGE_KEY, 'default');
const themeStorage = useLocalStorage<StoredUiThemeVars | null>(THEME_STORAGE_KEY, null);
const themeModeStorage = useLocalStorage<UiThemeMode>(THEME_MODE_STORAGE_KEY, 'auto');

if (themeStorage.value && Object.keys(themeStorage.value).length > 20) {
    themeStorage.value = null;
}

const uiThemePreset = ref<UiThemePresetName>(normalizePresetName(themePresetStorage.value));
const uiThemeMode = ref<UiThemeMode>(normalizeThemeMode(themeModeStorage.value));
const uiThemeVars = ref<UiThemeVars>(
    applyUserOverrides(
        resolveThemeBase(uiThemePreset.value, uiThemeMode.value),
        uiThemeMode.value !== 'auto' ? (themeStorage.value as StoredUiThemeVars | null) : null
    )
);

provide(uiThemeKey, uiThemeVars);
provide(uiThemeModeKey, uiThemeMode);
provide(uiThemePresetKey, uiThemePreset);

const systemThemeMedia = window.matchMedia?.('(prefers-color-scheme: dark)');
const applySystemTheme = () => {
    if (uiThemeMode.value === 'auto') {
        uiThemeVars.value = resolveThemeBase(uiThemePreset.value, 'auto');
    }
};

systemThemeMedia?.addEventListener('change', applySystemTheme);

if (isAuthenticated.value) {
    getCurrentUser()
        .then(response => {
            if (response.code === 200) setCurrentAuth(response.data);
        })
        .catch(() => {});
}

watch(
    uiThemeVars,
    newVal => {
        if (uiThemeMode.value === 'auto') return;
        const base = resolveThemeBase(uiThemePreset.value, uiThemeMode.value);
        const diffs: Record<string, unknown> = {};
        for (const key of Object.keys(newVal) as Array<keyof UiThemeVars>) {
            if (newVal[key] !== base[key]) {
                diffs[key] = newVal[key];
            }
        }
        const keys = Object.keys(diffs);
        if (keys.length === 0) {
            themeStorage.value = null;
        } else {
            themeStorage.value = diffs as StoredUiThemeVars;
        }
    },
    { deep: true }
);

watch(
    uiThemeMode,
    newMode => {
        themeModeStorage.value = newMode;
        uiThemeVars.value = applyUserOverrides(
            resolveThemeBase(uiThemePreset.value, newMode),
            newMode !== 'auto' ? (themeStorage.value as StoredUiThemeVars | null) : null
        );
    },
    { immediate: true }
);

watch(uiThemePreset, newPreset => {
    themePresetStorage.value = newPreset;
    themeStorage.value = null;
    uiThemeVars.value = resolveThemeBase(newPreset, uiThemeMode.value);
});

const mixThemeColor = (color: string, colorRatio: number, base: string) => {
    return `color-mix(in srgb, ${color} ${colorRatio}%, ${base})`;
};

const themeOverrides = computed<GlobalThemeOverrides>(() => {
    const vars = uiThemeVars.value;

    return {
        common: {
            fontFamily: "'Lato', sans-serif",
            fontFamilyMono: "'Fira Code', monospace",
            borderRadius: vars.cardRadius,
            bodyColor: vars.bodyColor,
            primaryColor: vars.primaryColor,
            primaryColorHover: vars.primaryColorHover,
            primaryColorPressed: vars.primaryColorPressed,
            primaryColorSuppl: vars.primaryColorSuppl,
            infoColor: vars.infoColor,
            infoColorHover: mixThemeColor(vars.infoColor, 82, vars.cardColor),
            infoColorPressed: mixThemeColor(vars.infoColor, 82, '#000000'),
            infoColorSuppl: mixThemeColor(vars.infoColor, 35, vars.cardColor),
            successColor: vars.successColor,
            successColorHover: mixThemeColor(vars.successColor, 82, vars.cardColor),
            successColorPressed: mixThemeColor(vars.successColor, 82, '#000000'),
            successColorSuppl: mixThemeColor(vars.successColor, 35, vars.cardColor),
            warningColor: vars.warningColor,
            warningColorHover: mixThemeColor(vars.warningColor, 82, vars.cardColor),
            warningColorPressed: mixThemeColor(vars.warningColor, 82, '#000000'),
            warningColorSuppl: mixThemeColor(vars.warningColor, 35, vars.cardColor),
            errorColor: vars.errorColor,
            errorColorHover: mixThemeColor(vars.errorColor, 82, vars.cardColor),
            errorColorPressed: mixThemeColor(vars.errorColor, 82, '#000000'),
            errorColorSuppl: mixThemeColor(vars.errorColor, 35, vars.cardColor),
            cardColor: vars.cardColor,
            textColor1: vars.textColor,
            textColor2: vars.secondaryTextColor,
            textColor3: vars.mutedTextColor,
            placeholderColor: vars.controlPlaceholderColor,
            dividerColor: vars.borderColor,
            borderColor: vars.controlBorderColor
        },
        Layout: {
            color: uiThemeVars.value.bodyColor,
            siderColor: uiThemeVars.value.cardColor
        },
        Menu: {
            itemTextColorActive: uiThemeVars.value.primaryColor,
            itemIconColorActive: uiThemeVars.value.primaryColor,
            itemColorActive: uiThemeVars.value.panelColor,
            itemColorActiveHover: uiThemeVars.value.panelColor,
            itemColorHover: uiThemeVars.value.panelColor,
            borderRadius: uiThemeVars.value.cardRadius
        },
        Input: {
            color: uiThemeVars.value.controlColor,
            colorFocus: uiThemeVars.value.controlColorFocus,
            colorDisabled: uiThemeVars.value.controlColorDisabled,
            textColor: uiThemeVars.value.controlTextColor,
            textColorDisabled: uiThemeVars.value.mutedTextColor,
            placeholderColor: uiThemeVars.value.controlPlaceholderColor,
            placeholderColorDisabled: uiThemeVars.value.mutedTextColor,
            border: `1px solid ${uiThemeVars.value.controlBorderColor}`,
            borderHover: `1px solid ${uiThemeVars.value.controlBorderHoverColor}`,
            borderFocus: `1px solid ${uiThemeVars.value.controlBorderFocusColor}`,
            borderDisabled: `1px solid ${uiThemeVars.value.borderColor}`,
            boxShadowFocus: uiThemeVars.value.focusRingShadow,
            caretColor: uiThemeVars.value.primaryColor,
            iconColor: uiThemeVars.value.iconColor,
            iconColorHover: uiThemeVars.value.primaryColorHover,
            iconColorPressed: uiThemeVars.value.primaryColorPressed,
            suffixTextColor: uiThemeVars.value.secondaryTextColor
        },
        InternalSelection: {
            color: uiThemeVars.value.controlColor,
            colorActive: uiThemeVars.value.controlColorFocus,
            colorDisabled: uiThemeVars.value.controlColorDisabled,
            textColor: uiThemeVars.value.controlTextColor,
            textColorDisabled: uiThemeVars.value.mutedTextColor,
            placeholderColor: uiThemeVars.value.controlPlaceholderColor,
            placeholderColorDisabled: uiThemeVars.value.mutedTextColor,
            border: `1px solid ${uiThemeVars.value.controlBorderColor}`,
            borderHover: `1px solid ${uiThemeVars.value.controlBorderHoverColor}`,
            borderActive: `1px solid ${uiThemeVars.value.controlBorderFocusColor}`,
            borderFocus: `1px solid ${uiThemeVars.value.controlBorderFocusColor}`,
            boxShadowHover: 'none',
            boxShadowActive: uiThemeVars.value.focusRingShadow,
            boxShadowFocus: uiThemeVars.value.focusRingShadow,
            caretColor: uiThemeVars.value.primaryColor,
            arrowColor: uiThemeVars.value.iconColor,
            clearColor: uiThemeVars.value.mutedTextColor,
            clearColorHover: uiThemeVars.value.secondaryTextColor,
            clearColorPressed: uiThemeVars.value.primaryColorPressed,
            peers: {
                Popover: {
                    color: uiThemeVars.value.cardColor,
                    textColor: uiThemeVars.value.textColor,
                    dividerColor: uiThemeVars.value.borderColor,
                    boxShadow: uiThemeVars.value.elevatedShadow
                }
            }
        },
        Select: {
            menuBoxShadow: uiThemeVars.value.elevatedShadow,
            peers: {
                InternalSelection: {
                    color: uiThemeVars.value.controlColor,
                    colorActive: uiThemeVars.value.controlColorFocus,
                    textColor: uiThemeVars.value.controlTextColor,
                    placeholderColor: uiThemeVars.value.controlPlaceholderColor,
                    border: `1px solid ${uiThemeVars.value.controlBorderColor}`,
                    borderHover: `1px solid ${uiThemeVars.value.controlBorderHoverColor}`,
                    borderActive: `1px solid ${uiThemeVars.value.controlBorderFocusColor}`,
                    borderFocus: `1px solid ${uiThemeVars.value.controlBorderFocusColor}`,
                    boxShadowActive: uiThemeVars.value.focusRingShadow,
                    boxShadowFocus: uiThemeVars.value.focusRingShadow,
                    arrowColor: uiThemeVars.value.iconColor
                },
                InternalSelectMenu: {
                    color: uiThemeVars.value.cardColor,
                    optionTextColor: uiThemeVars.value.textColor,
                    optionTextColorActive: uiThemeVars.value.primaryColor,
                    optionColorPending: uiThemeVars.value.panelColor,
                    optionColorActive: uiThemeVars.value.panelColor,
                    optionColorActivePending: uiThemeVars.value.panelColor,
                    actionDividerColor: uiThemeVars.value.borderColor
                }
            }
        },
        Tag: {
            border: `1px solid ${uiThemeVars.value.controlBorderColor}`,
            color: uiThemeVars.value.controlTagColor,
            colorBordered: uiThemeVars.value.controlTagColor,
            textColor: uiThemeVars.value.controlTagTextColor,
            closeIconColor: uiThemeVars.value.iconColor,
            closeIconColorHover: uiThemeVars.value.primaryColorHover,
            closeIconColorPressed: uiThemeVars.value.primaryColorPressed,
            borderPrimary: `1px solid ${uiThemeVars.value.primaryColor}`,
            textColorPrimary: uiThemeVars.value.primaryColor,
            colorPrimary: uiThemeVars.value.controlTagColor,
            borderInfo: `1px solid ${uiThemeVars.value.infoColor}`,
            textColorInfo: uiThemeVars.value.infoColor,
            colorInfo: uiThemeVars.value.controlTagColor,
            borderSuccess: `1px solid ${uiThemeVars.value.successColor}`,
            textColorSuccess: uiThemeVars.value.successColor,
            colorSuccess: uiThemeVars.value.controlTagColor,
            borderWarning: `1px solid ${uiThemeVars.value.warningColor}`,
            textColorWarning: uiThemeVars.value.warningColor,
            colorWarning: uiThemeVars.value.controlTagColor,
            borderError: `1px solid ${uiThemeVars.value.errorColor}`,
            textColorError: uiThemeVars.value.errorColor,
            colorError: uiThemeVars.value.controlTagColor
        },
        Button: {
            color: uiThemeVars.value.controlColor,
            colorHover: uiThemeVars.value.controlColorFocus,
            colorPressed: uiThemeVars.value.panelColor,
            colorFocus: uiThemeVars.value.controlColorFocus,
            colorDisabled: uiThemeVars.value.controlColorDisabled,
            textColor: uiThemeVars.value.controlTextColor,
            textColorHover: uiThemeVars.value.primaryColorHover,
            textColorPressed: uiThemeVars.value.primaryColorPressed,
            textColorFocus: uiThemeVars.value.primaryColor,
            textColorDisabled: uiThemeVars.value.mutedTextColor,
            border: `1px solid ${uiThemeVars.value.controlBorderColor}`,
            borderHover: `1px solid ${uiThemeVars.value.controlBorderHoverColor}`,
            borderPressed: `1px solid ${uiThemeVars.value.controlBorderFocusColor}`,
            borderFocus: `1px solid ${uiThemeVars.value.controlBorderFocusColor}`,
            borderDisabled: `1px solid ${uiThemeVars.value.borderColor}`,
            rippleColor: uiThemeVars.value.primaryColor,
            colorPrimary: uiThemeVars.value.primaryColor,
            colorHoverPrimary: uiThemeVars.value.primaryColorHover,
            colorPressedPrimary: uiThemeVars.value.primaryColorPressed,
            colorFocusPrimary: uiThemeVars.value.primaryColorHover,
            textColorPrimary: '#ffffff',
            textColorHoverPrimary: '#ffffff',
            textColorPressedPrimary: '#ffffff',
            textColorFocusPrimary: '#ffffff',
            borderPrimary: `1px solid ${uiThemeVars.value.primaryColor}`,
            borderHoverPrimary: `1px solid ${uiThemeVars.value.primaryColorHover}`,
            borderPressedPrimary: `1px solid ${uiThemeVars.value.primaryColorPressed}`,
            borderFocusPrimary: `1px solid ${uiThemeVars.value.primaryColorHover}`
        },
        BackTop: {
            color: uiThemeVars.value.backTopColor,
            textColor: uiThemeVars.value.backTopIconColor,
            iconColor: uiThemeVars.value.backTopIconColor,
            iconColorHover: uiThemeVars.value.backTopIconHoverColor,
            iconColorPressed: uiThemeVars.value.primaryColorPressed,
            boxShadow: uiThemeVars.value.elevatedShadow,
            boxShadowHover: uiThemeVars.value.elevatedShadow,
            boxShadowPressed: uiThemeVars.value.elevatedShadow,
            borderRadius: uiThemeVars.value.pillRadius
        },
        Alert: {
            color: vars.panelColor,
            colorInfo: vars.alertInfoBackgroundColor,
            colorSuccess: vars.alertSuccessBackgroundColor,
            colorWarning: vars.alertWarningBackgroundColor,
            colorError: vars.alertErrorBackgroundColor,
            border: `1px solid ${uiThemeVars.value.borderColor}`,
            borderInfo: `1px solid ${uiThemeVars.value.infoColor}`,
            borderSuccess: `1px solid ${uiThemeVars.value.successColor}`,
            borderWarning: `1px solid ${uiThemeVars.value.warningColor}`,
            borderError: `1px solid ${uiThemeVars.value.errorColor}`,
            titleTextColor: uiThemeVars.value.cardTitleColor,
            contentTextColor: uiThemeVars.value.textColor,
            iconColor: uiThemeVars.value.primaryColor,
            iconColorInfo: uiThemeVars.value.infoColor,
            iconColorSuccess: uiThemeVars.value.successColor,
            iconColorWarning: uiThemeVars.value.warningColor,
            iconColorError: uiThemeVars.value.errorColor
        },
        Dialog: {
            color: uiThemeVars.value.cardColor,
            textColor: uiThemeVars.value.textColor,
            titleTextColor: uiThemeVars.value.cardTitleColor,
            iconColor: uiThemeVars.value.primaryColor,
            iconColorInfo: uiThemeVars.value.infoColor,
            iconColorSuccess: uiThemeVars.value.successColor,
            iconColorWarning: uiThemeVars.value.warningColor,
            iconColorError: uiThemeVars.value.errorColor,
            closeIconColor: uiThemeVars.value.iconColor,
            closeIconColorHover: uiThemeVars.value.primaryColorHover,
            closeIconColorPressed: uiThemeVars.value.primaryColorPressed,
            boxShadow: uiThemeVars.value.elevatedShadow,
            borderRadius: uiThemeVars.value.cardRadius
        },
        Pagination: {
            itemColor: uiThemeVars.value.controlColor,
            itemColorHover: uiThemeVars.value.controlColorFocus,
            itemColorPressed: uiThemeVars.value.panelColor,
            itemColorActive: uiThemeVars.value.primaryColor,
            itemColorActiveHover: uiThemeVars.value.primaryColorHover,
            itemColorDisabled: uiThemeVars.value.controlColorDisabled,
            itemTextColor: uiThemeVars.value.controlTextColor,
            itemTextColorHover: uiThemeVars.value.primaryColorHover,
            itemTextColorPressed: uiThemeVars.value.primaryColorPressed,
            itemTextColorActive: '#ffffff',
            itemTextColorDisabled: uiThemeVars.value.mutedTextColor,
            itemBorder: `1px solid ${uiThemeVars.value.controlBorderColor}`,
            itemBorderHover: `1px solid ${uiThemeVars.value.controlBorderHoverColor}`,
            itemBorderPressed: `1px solid ${uiThemeVars.value.controlBorderFocusColor}`,
            itemBorderActive: `1px solid ${uiThemeVars.value.primaryColor}`,
            itemBorderDisabled: `1px solid ${uiThemeVars.value.borderColor}`,
            buttonColorHover: uiThemeVars.value.controlColorFocus,
            buttonColorPressed: uiThemeVars.value.panelColor,
            buttonColorDisabled: uiThemeVars.value.controlColorDisabled,
            buttonIconColor: uiThemeVars.value.iconColor,
            buttonIconColorHover: uiThemeVars.value.primaryColorHover,
            buttonIconColorPressed: uiThemeVars.value.primaryColorPressed,
            buttonIconColorDisabled: uiThemeVars.value.mutedTextColor
        },
        Slider: {
            railColor: uiThemeVars.value.sliderRailColor,
            railColorHover: uiThemeVars.value.sliderRailHoverColor,
            fillColor: uiThemeVars.value.sliderFillColor,
            fillColorHover: uiThemeVars.value.sliderFillHoverColor,
            handleColor: uiThemeVars.value.sliderHandleColor,
            handleBoxShadow: `0 0 0 1px ${uiThemeVars.value.controlBorderColor}`,
            handleBoxShadowHover: `0 0 0 1px ${uiThemeVars.value.controlBorderHoverColor}`,
            handleBoxShadowActive: `0 0 0 1px ${uiThemeVars.value.controlBorderFocusColor}`,
            handleBoxShadowFocus: uiThemeVars.value.focusRingShadow,
            dotColor: uiThemeVars.value.controlColor,
            dotColorModal: uiThemeVars.value.controlColor,
            dotColorPopover: uiThemeVars.value.controlColor,
            dotBorder: `1px solid ${uiThemeVars.value.controlBorderColor}`,
            dotBorderActive: `1px solid ${uiThemeVars.value.sliderFillColor}`,
            indicatorColor: uiThemeVars.value.cardColor,
            indicatorTextColor: uiThemeVars.value.textColor,
            indicatorBoxShadow: uiThemeVars.value.elevatedShadow,
            indicatorBorderRadius: uiThemeVars.value.cardRadius
        },
        Message: {
            color: uiThemeVars.value.cardColor,
            colorInfo: uiThemeVars.value.cardColor,
            colorSuccess: uiThemeVars.value.cardColor,
            colorError: uiThemeVars.value.cardColor,
            colorWarning: uiThemeVars.value.cardColor,
            colorLoading: uiThemeVars.value.cardColor,
            textColor: uiThemeVars.value.textColor,
            textColorInfo: uiThemeVars.value.textColor,
            textColorSuccess: uiThemeVars.value.textColor,
            textColorError: uiThemeVars.value.textColor,
            textColorWarning: uiThemeVars.value.textColor,
            textColorLoading: uiThemeVars.value.textColor,
            iconColor: uiThemeVars.value.primaryColor,
            iconColorInfo: uiThemeVars.value.infoColor,
            iconColorSuccess: uiThemeVars.value.successColor,
            iconColorWarning: uiThemeVars.value.warningColor,
            iconColorError: uiThemeVars.value.errorColor,
            iconColorLoading: uiThemeVars.value.primaryColor,
            loadingColor: uiThemeVars.value.primaryColor,
            border: `1px solid ${uiThemeVars.value.borderColor}`,
            boxShadow: uiThemeVars.value.elevatedShadow,
            boxShadowInfo: uiThemeVars.value.elevatedShadow,
            boxShadowSuccess: uiThemeVars.value.elevatedShadow,
            boxShadowError: uiThemeVars.value.elevatedShadow,
            boxShadowWarning: uiThemeVars.value.elevatedShadow,
            boxShadowLoading: uiThemeVars.value.elevatedShadow
        },
        Skeleton: {
            color: uiThemeVars.value.panelColor,
            colorEnd: uiThemeVars.value.controlColorDisabled,
            borderRadius: uiThemeVars.value.cardRadius
        },
        Spin: {
            color: uiThemeVars.value.primaryColor,
            textColor: uiThemeVars.value.textColor
        },
        Space: {
            gapSmall: '8px 8px',
            gapMedium: '12px 12px',
            gapLarge: '16px 16px'
        },
        Statistic: {
            labelTextColor: uiThemeVars.value.secondaryTextColor,
            valueTextColor: uiThemeVars.value.textColor,
            valuePrefixTextColor: uiThemeVars.value.textColor,
            valueSuffixTextColor: uiThemeVars.value.secondaryTextColor
        },
        DataTable: {
            thColor: vars.tableHeaderColor,
            thTextColor: vars.textColor,
            tdColor: vars.cardColor,
            tdTextColor: vars.textColor
        }
    };
});

const themeCssVars = computed(() => {
    const vars = uiThemeVars.value;
    return {
        '--ui-body-color': vars.bodyColor,
        '--ui-body-gradient-start': vars.bodyGradientStart,
        '--ui-body-gradient-end': vars.bodyGradientEnd,
        '--ui-primary-color': vars.primaryColor,
        '--ui-primary-color-hover': vars.primaryColorHover,
        '--ui-primary-color-pressed': vars.primaryColorPressed,
        '--ui-primary-color-suppl': vars.primaryColorSuppl,
        '--ui-card-color': vars.cardColor,
        '--ui-translucent-card-color': vars.translucentCardColor,
        '--ui-card-title-color': vars.cardTitleColor,
        '--ui-text-color': vars.textColor,
        '--ui-secondary-text-color': vars.secondaryTextColor,
        '--ui-muted-text-color': vars.mutedTextColor,
        '--ui-border-color': vars.borderColor,
        '--ui-panel-color': vars.panelColor,
        '--ui-control-color': vars.controlColor,
        '--ui-control-color-focus': vars.controlColorFocus,
        '--ui-control-color-disabled': vars.controlColorDisabled,
        '--ui-control-text-color': vars.controlTextColor,
        '--ui-control-placeholder-color': vars.controlPlaceholderColor,
        '--ui-control-border-color': vars.controlBorderColor,
        '--ui-control-border-hover-color': vars.controlBorderHoverColor,
        '--ui-control-border-focus-color': vars.controlBorderFocusColor,
        '--ui-control-tag-color': vars.controlTagColor,
        '--ui-control-tag-text-color': vars.controlTagTextColor,
        '--ui-slider-rail-color': vars.sliderRailColor,
        '--ui-slider-rail-hover-color': vars.sliderRailHoverColor,
        '--ui-slider-fill-color': vars.sliderFillColor,
        '--ui-slider-fill-hover-color': vars.sliderFillHoverColor,
        '--ui-slider-handle-color': vars.sliderHandleColor,
        '--ui-back-top-color': vars.backTopColor,
        '--ui-back-top-hover-color': vars.backTopHoverColor,
        '--ui-back-top-icon-color': vars.backTopIconColor,
        '--ui-back-top-icon-hover-color': vars.backTopIconHoverColor,
        '--ui-code-background-color': vars.codeBackgroundColor,
        '--ui-code-text-color': vars.codeTextColor,
        '--ui-code-theme': vars.codeTheme,
        '--ui-inline-code-background-color': vars.inlineCodeBackgroundColor,
        '--ui-inline-code-text-color': vars.inlineCodeTextColor,
        '--ui-mark-background-color': vars.markBackgroundColor,
        '--ui-table-header-color': vars.tableHeaderColor,
        '--ui-scrollbar-track-color': vars.scrollbarTrackColor,
        '--ui-scrollbar-thumb-color': vars.scrollbarThumbColor,
        '--ui-copy-button-background-color': vars.copyButtonBackgroundColor,
        '--ui-copy-button-text-color': vars.copyButtonTextColor,
        '--ui-footer-text-color': vars.footerTextColor,
        '--ui-link-color': vars.linkColor,
        '--ui-link-hover-color': vars.linkHoverColor,
        '--ui-info-color': vars.infoColor,
        '--ui-success-color': vars.successColor,
        '--ui-warning-color': vars.warningColor,
        '--ui-error-color': vars.errorColor,
        '--ui-alert-info-background-color': vars.alertInfoBackgroundColor,
        '--ui-alert-success-background-color': vars.alertSuccessBackgroundColor,
        '--ui-alert-warning-background-color': vars.alertWarningBackgroundColor,
        '--ui-alert-error-background-color': vars.alertErrorBackgroundColor,
        '--ui-orange-color': vars.orangeColor,
        '--ui-cyan-color': vars.cyanColor,
        '--ui-muted-accent-color': vars.mutedAccentColor,
        '--ui-card-shadow': vars.cardShadow,
        '--ui-elevated-shadow': vars.elevatedShadow,
        '--ui-focus-ring-shadow': vars.focusRingShadow,
        '--ui-card-radius': vars.cardRadius,
        '--ui-pill-radius': vars.pillRadius,
        '--ui-icon-color': vars.iconColor,
        '--ui-user-red-color': presets.default.light.userRedColor,
        '--ui-user-orange-color': presets.default.light.userOrangeColor,
        '--ui-user-purple-color': presets.default.light.userPurpleColor,
        '--ui-user-green-color': presets.default.light.userGreenColor,
        '--ui-user-blue-color': presets.default.light.userBlueColor,
        '--ui-user-gray-color': presets.default.light.userGrayColor,
        '--ui-user-cheater-color': presets.default.light.userCheaterColor,
        '--ui-prize-green-color': presets.default.light.prizeGreenColor,
        '--ui-prize-blue-color': presets.default.light.prizeBlueColor,
        '--ui-prize-gold-color': presets.default.light.prizeGoldColor,
        '--ui-category-personal-color': vars.categoryPersonalColor,
        '--ui-category-solution-color': vars.categorySolutionColor,
        '--ui-category-tech-color': vars.categoryTechColor,
        '--ui-category-algorithm-color': vars.categoryAlgorithmColor,
        '--ui-category-life-color': vars.categoryLifeColor,
        '--ui-category-study-color': vars.categoryStudyColor,
        '--ui-category-fun-color': vars.categoryFunColor,
        '--ui-category-chat-color': vars.categoryChatColor,
        '--ui-category-unknown-color': vars.categoryUnknownColor
    };
});

watch(
    themeCssVars,
    vars => {
        Object.entries(vars).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
        });
        document.documentElement.dataset.uiCodeTheme = uiThemeVars.value.codeTheme;
    },
    { immediate: true }
);

const handleMenuSelect = (key: string) => {
    if (key === 'home') {
        router.push('/');
    } else if (key === 'benben') {
        window.open('https://benben.sbs', '_blank');
    } else {
        router.push(`/${key}`);
    }
};

const foundDate = new Date('2025-02-12T00:00:00Z').getTime();
const timeSinceFound = ref(Math.floor((Date.now() - foundDate) / 1000));
setInterval(() => {
    timeSinceFound.value = Math.floor((Date.now() - foundDate) / 1000);
}, 1000);
</script>

<style scoped>
.n-layout {
    height: 100vh;
}

.app-shell {
    /* 悬浮侧栏占掉的横向空间，页脚的反向负边距也要跨过它。 */
    --sidebar-reserve: calc(var(--ui-sidebar-inset) * 2 + var(--ui-sidebar-width-collapsed));

    position: relative;
    padding-left: var(--sidebar-reserve);
}

.app-main {
    background: var(--ui-card-color);
}

/* 一整块浮在页面上的玻璃板，四边留白。这里不能有背景色与阴影：玻璃采样的就是它们背后的内容。 */
.app-sider {
    --sidebar-width: var(--ui-sidebar-width-collapsed);

    position: fixed;
    top: var(--ui-sidebar-inset);
    bottom: var(--ui-sidebar-inset);
    left: var(--ui-sidebar-inset);
    z-index: 1100;
    width: var(--sidebar-width);
    background: transparent;
}

.app-sider:not(.is-collapsed) {
    --sidebar-width: var(--ui-sidebar-width);
}

/* 宽度过渡期间玻璃面每帧都在改尺寸，折射滤镜会跟着反复重建，所以默认关闭。 */
.app-sider.has-expand-animation {
    transition: width 0.24s cubic-bezier(0.32, 0.72, 0, 1);
}

.app-sider__surface {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
}

/* 与玻璃面平级：玻璃面 content 层带形状的 clip-path，放进那里的内容会被裁，也会截断嵌套玻璃。 */
.app-sider__body {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.app-sider__menu {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    /* 内容照常滚动，滚动条不画：它贴着玻璃边缘会读成玻璃的边。 */
    scrollbar-width: none;
}

.app-sider__menu::-webkit-scrollbar {
    display: none;
}

.brand-shell {
    flex: none;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: var(--ui-control-gap);
    padding: 0 16px;
    overflow: hidden;
    box-sizing: border-box;
    border-bottom: 1px solid var(--ui-border-color);
}

.brand-logo {
    width: 32px;
    height: 32px;
    flex: 0 0 32px;
    color: var(--ui-icon-color);
    font-size: 32px;
}

.brand-text {
    color: var(--ui-card-title-color);
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.02em;
    white-space: nowrap;
}

.app-sider:not(.is-collapsed) :deep(.n-menu-item-content__icon) {
    margin-right: var(--ui-space-3) !important;
}

.app-footer {
    margin: var(--ui-page-padding) calc(-1 * var(--ui-page-padding))
        calc(-1 * var(--ui-page-padding));
    margin-left: calc(-1 * (var(--ui-page-padding) + var(--sidebar-reserve)));
    padding: var(--ui-space-4) var(--ui-space-10);
    background: var(--ui-translucent-card-color);
    color: var(--ui-footer-text-color);
    backdrop-filter: blur(16px);
}

.footer-grid {
    /* Preserve the former paragraph spacing after moving each row into its own grid item. */
    row-gap: 1em !important;
    padding-block: 1em;
}

.footer-element {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    min-width: 0;
    margin: 0;
}
.footer-element.right-aligned {
    justify-content: flex-end;
}
.footer-element > :nth-child(2) {
    margin-left: 8px;
}
.footer-element > a > :nth-child(2) {
    margin-left: 8px;
}
.footer-link {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    min-width: 0;
}
.footer-element span,
.footer-link span {
    min-width: 0;
    overflow-wrap: anywhere;
}
.footer-link,
.footer-element a {
    color: var(--ui-footer-text-color);
    transition: color 0.2s;
    text-decoration: none;
}
.footer-link:hover,
.footer-element a:hover {
    color: var(--ui-footer-text-color) !important;
}
.footer-link:not(:first-child) {
    margin-left: var(--ui-space-4);
}
.router-view {
    max-width: min(1680px, 100%);
    margin: 0 auto;
    min-height: calc(100vh - var(--ui-page-padding) - var(--ui-page-padding));
}

:deep(.n-back-top:hover) {
    background-color: var(--ui-back-top-hover-color) !important;
}

:deep(.back-top-action) {
    border-radius: var(--ui-pill-radius) !important;
    color: var(--ui-back-top-icon-color) !important;
    background: var(--ui-back-top-color) !important;
}

@media (max-width: 768px) {
    .app-shell {
        position: relative;
        --sidebar-reserve: 0px;
        padding-left: 0;
    }

    /* Mobile navigation is the liquid glass tab bar; the sider is desktop-only. */
    .app-sider {
        display: none;
    }

    .app-main {
        width: 100vw;
    }

    .app-main :deep(.n-layout-scroll-container) {
        padding: var(--ui-page-padding-mobile) !important;
        padding-bottom: calc(
            var(--ui-page-padding-mobile) + var(--ui-mobile-tab-bar-height)
        ) !important;
    }

    .has-mobile-top-bar .app-main :deep(.n-layout-scroll-container) {
        padding-top: calc(
            var(--ui-page-padding-mobile) + var(--ui-mobile-top-bar-height)
        ) !important;
    }

    :deep(.n-layout-content) {
        padding: 0 !important;
    }

    .app-footer {
        padding: var(--ui-space-3) var(--ui-space-4);
        margin: var(--ui-page-padding-mobile) calc(-1 * var(--ui-page-padding-mobile))
            calc(-1 * var(--ui-page-padding-mobile));
    }
}

@media (max-width: 639px) {
    .footer-legal {
        order: 5;
    }

    .footer-copyright {
        order: 6;
    }

    .footer-element,
    .footer-element.right-aligned {
        justify-content: center;
        text-align: center;
    }

    .footer-link {
        justify-content: center;
    }
}
</style>
