import { Advertisement } from '@/entities/advertisement';
import { getServiceRepository } from '@/services/helpers/repository.helper';

type AdvertisementInput = {
    id?: unknown;
    imageUrl?: unknown;
    altText?: unknown;
    targetUrl?: unknown;
    enabled?: unknown;
    sortOrder?: unknown;
};

type ReplaceAdvertisementsInput = {
    advertisements?: unknown;
};

type NormalizedAdvertisementInput = {
    id: number | null;
    imageUrl: string;
    altText: string;
    targetUrl: string | null;
    enabled: boolean;
    sortOrder: number;
};

export type AdminAdvertisementItem = {
    id: number;
    imageUrl: string;
    altText: string;
    targetUrl: string | null;
    enabled: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
};

export type CurrentAdvertisementItem = {
    id: number;
    imageUrl: string;
    altText: string;
    targetUrl: string | null;
    sortOrder: number;
};

const MAX_ADVERTISEMENTS = 10;
const MAX_URL_LENGTH = 2048;
const MAX_ALT_TEXT_LENGTH = 255;

export class AdvertisementService {
    static async getAdminAdvertisements(): Promise<AdminAdvertisementItem[]> {
        const rows = await this.findOrderedAdvertisements();
        return rows.map(row => this.toAdminItem(row));
    }

    static async replaceAdminAdvertisements(
        input: ReplaceAdvertisementsInput
    ): Promise<AdminAdvertisementItem[]> {
        if (!Array.isArray(input.advertisements)) {
            throw Object.assign(new Error('advertisements must be an array'), { status: 400 });
        }
        if (input.advertisements.length > MAX_ADVERTISEMENTS) {
            throw Object.assign(
                new Error(`advertisements must contain at most ${MAX_ADVERTISEMENTS} items`),
                {
                    status: 400
                }
            );
        }

        const normalized = input.advertisements.map(item => this.normalizeInput(item));

        await Advertisement.transaction(async manager => {
            const repository = getServiceRepository<Advertisement>(Advertisement, manager);
            const existing = await repository.find();
            const existingById = new Map(existing.map(row => [row.id, row]));
            const keptIds = new Set<number>();

            for (const item of normalized) {
                const advertisement =
                    item.id && existingById.has(item.id)
                        ? existingById.get(item.id)!
                        : repository.create();

                advertisement.imageUrl = item.imageUrl;
                advertisement.altText = item.altText;
                advertisement.targetUrl = item.targetUrl;
                advertisement.enabled = item.enabled;
                advertisement.sortOrder = item.sortOrder;

                await repository.save(advertisement);
                keptIds.add(advertisement.id);
            }

            const deleteIds = existing.map(row => row.id).filter(id => !keptIds.has(id));
            if (deleteIds.length > 0) await repository.delete(deleteIds);
        });

        return await this.getAdminAdvertisements();
    }

    static async getCurrentAdvertisements(): Promise<CurrentAdvertisementItem[]> {
        const rows = await getServiceRepository<Advertisement>(Advertisement).find({
            where: { enabled: true },
            order: { sortOrder: 'ASC', id: 'ASC' },
            take: MAX_ADVERTISEMENTS
        });
        return rows.map(row => this.toCurrentItem(row));
    }

    private static async findOrderedAdvertisements() {
        return await getServiceRepository<Advertisement>(Advertisement).find({
            order: { sortOrder: 'ASC', id: 'ASC' }
        });
    }

    private static normalizeInput(input: unknown): NormalizedAdvertisementInput {
        const item = (input && typeof input === 'object' ? input : {}) as AdvertisementInput;
        const id = Number(item.id);
        const sortOrder = Number(item.sortOrder);
        const altText = String(item.altText ?? '').trim();

        if (!altText) {
            throw Object.assign(new Error('altText is required'), { status: 400 });
        }
        if (altText.length > MAX_ALT_TEXT_LENGTH) {
            throw Object.assign(
                new Error(`altText must contain at most ${MAX_ALT_TEXT_LENGTH} characters`),
                {
                    status: 400
                }
            );
        }

        return {
            id: Number.isInteger(id) && id > 0 ? id : null,
            imageUrl: this.normalizeUrl(item.imageUrl, 'imageUrl', false)!,
            altText,
            targetUrl: this.normalizeUrl(item.targetUrl, 'targetUrl', true),
            enabled: Boolean(item.enabled),
            sortOrder: Number.isFinite(sortOrder) ? Math.trunc(sortOrder) : 0
        };
    }

    private static normalizeUrl(value: unknown, field: string, allowEmpty: boolean): string | null {
        const input = String(value ?? '').trim();
        if (!input) {
            if (allowEmpty) return null;
            throw Object.assign(new Error(`${field} is required`), { status: 400 });
        }

        let url: URL;
        try {
            url = new URL(input);
        } catch {
            throw Object.assign(new Error(`${field} must be a valid HTTP(S) URL`), { status: 400 });
        }

        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            throw Object.assign(new Error(`${field} must be a valid HTTP(S) URL`), { status: 400 });
        }

        const normalized = url.toString();
        if (normalized.length > MAX_URL_LENGTH) {
            throw Object.assign(
                new Error(`${field} must contain at most ${MAX_URL_LENGTH} characters`),
                {
                    status: 400
                }
            );
        }
        return normalized;
    }

    private static toAdminItem(row: Advertisement): AdminAdvertisementItem {
        return {
            id: row.id,
            imageUrl: row.imageUrl,
            altText: row.altText,
            targetUrl: row.targetUrl,
            enabled: Boolean(row.enabled),
            sortOrder: row.sortOrder,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        };
    }

    private static toCurrentItem(row: Advertisement): CurrentAdvertisementItem {
        return {
            id: row.id,
            imageUrl: row.imageUrl,
            altText: row.altText,
            targetUrl: row.targetUrl,
            sortOrder: row.sortOrder
        };
    }
}
