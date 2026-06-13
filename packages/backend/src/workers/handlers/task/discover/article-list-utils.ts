export type ArticleListResponse = {
    data?: {
        articles?: {
            perPage?: number;
            count?: number;
            result?: Array<{ lid?: unknown }>;
        };
    };
};

export function extractArticleIds(resp: ArticleListResponse) {
    const ids: string[] = [];
    const seen = new Set<string>();
    const items = resp?.data?.articles?.result;
    if (!Array.isArray(items)) return ids;

    for (const item of items) {
        const id = typeof item?.lid === 'string' ? item.lid.trim() : '';
        if (!/^[A-Za-z0-9]{1,8}$/.test(id) || seen.has(id)) continue;
        seen.add(id);
        ids.push(id);
    }
    return ids;
}

export function getTotalPages(resp: ArticleListResponse) {
    const perPage = Number(resp?.data?.articles?.perPage);
    const count = Number(resp?.data?.articles?.count);
    if (!Number.isFinite(perPage) || !Number.isFinite(count) || perPage <= 0 || count < 0) {
        return null;
    }
    return Math.ceil(count / perPage);
}
