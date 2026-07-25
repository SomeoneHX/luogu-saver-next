import { describe, expect, it } from 'vitest';
import { getNextBookmarkCounter, type Bookmark } from '../src/composables/useBookmarks';

function bookmark(id: string): Bookmark {
    return {
        id,
        name: id,
        headingId: id,
        headingText: id,
        createdAt: 0
    };
}

describe('bookmark identifiers', () => {
    it('continues after the largest persisted counter instead of the array length', () => {
        expect(
            getNextBookmarkCounter('article-1', [
                bookmark('bm-article-1-1'),
                bookmark('bm-article-1-3')
            ])
        ).toBe(3);
    });

    it('ignores malformed and unrelated identifiers', () => {
        expect(
            getNextBookmarkCounter('article-1', [
                bookmark('bm-article-1-invalid'),
                bookmark('bm-article-1-1e2'),
                bookmark('bm-article-2-99')
            ])
        ).toBe(0);
    });
});
