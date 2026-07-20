import { useLocalStorage } from '@/composables/useLocalStorage';
import { CONTENT_BOOKMARK_STORAGE_PREFIX } from '@/utils/constants';
import { ref, watch } from 'vue';

export interface Bookmark {
    id: string;
    name: string;
    headingId: string;
    headingText: string;
    createdAt: number;
}

export function getNextBookmarkCounter(contentId: string, bookmarks: Bookmark[]): number {
    const idPrefix = `bm-${contentId}-`;
    return bookmarks.reduce((maximum, bookmark) => {
        if (!bookmark.id.startsWith(idPrefix)) return maximum;
        const suffix = bookmark.id.slice(idPrefix.length);
        if (!/^[1-9]\d*$/.test(suffix)) return maximum;
        const counter = Number(suffix);
        return Number.isSafeInteger(counter) && counter > maximum ? counter : maximum;
    }, 0);
}

export function useBookmarks(contentId: string) {
    const key = `${CONTENT_BOOKMARK_STORAGE_PREFIX}${contentId}`;
    const stored = useLocalStorage<Bookmark[]>(key, []);
    const bookmarks = ref<Bookmark[]>(stored.value ?? []);

    watch(
        bookmarks,
        newVal => {
            stored.value = newVal;
        },
        { deep: true }
    );

    let idCounter = getNextBookmarkCounter(contentId, bookmarks.value);

    const addBookmark = (headingId: string, headingText: string): Bookmark | null => {
        // Prevent duplicate bookmarks for the same heading
        if (bookmarks.value.some(b => b.headingId === headingId)) {
            return null;
        }
        idCounter++;
        const bookmark: Bookmark = {
            id: `bm-${contentId}-${idCounter}`,
            name: `段落收藏 #${idCounter}`,
            headingId,
            headingText,
            createdAt: Date.now()
        };
        bookmarks.value = [...bookmarks.value, bookmark];
        return bookmark;
    };

    const removeBookmark = (bookmarkId: string) => {
        bookmarks.value = bookmarks.value.filter(b => b.id !== bookmarkId);
    };

    /**
     * Toggle bookmark: add if not present, remove if already bookmarked.
     * Returns 'added' | 'removed' | null (null when add failed for other reasons).
     */
    const toggleBookmark = (headingId: string, headingText: string): 'added' | 'removed' | null => {
        if (bookmarks.value.some(b => b.headingId === headingId)) {
            bookmarks.value = bookmarks.value.filter(b => b.headingId !== headingId);
            return 'removed';
        }
        const result = addBookmark(headingId, headingText);
        return result ? 'added' : null;
    };

    const renameBookmark = (bookmarkId: string, newName: string) => {
        bookmarks.value = bookmarks.value.map(b =>
            b.id === bookmarkId ? { ...b, name: newName } : b
        );
    };

    return {
        bookmarks,
        toggleBookmark,
        removeBookmark,
        renameBookmark
    };
}
