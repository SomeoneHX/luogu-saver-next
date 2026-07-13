import { useLocalStorage } from '@/composables/useLocalStorage';
import { ref, computed } from 'vue';

export type ViewMode = 'default' | 'focus';

const VIEW_MODE_KEY = 'content_view_mode';
const VIEW_MODE_HINT_DISMISSED_KEY = 'content_view_mode_hint_dismissed';

export function useViewMode() {
    const stored = useLocalStorage<ViewMode>(VIEW_MODE_KEY, 'default');
    const viewMode = ref<ViewMode>(stored.value ?? 'default');
    const hintDismissed = useLocalStorage<boolean>(VIEW_MODE_HINT_DISMISSED_KEY, false);

    const isFocus = computed(() => viewMode.value === 'focus');

    const setViewMode = (mode: ViewMode) => {
        viewMode.value = mode;
        stored.value = mode;
    };

    const dismissHint = () => {
        hintDismissed.value = true;
    };

    return {
        viewMode,
        isFocus,
        setViewMode,
        dismissHint,
        hintDismissed
    };
}
