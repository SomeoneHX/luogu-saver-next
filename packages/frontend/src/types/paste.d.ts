import { User } from './user';

export interface Paste {
    id: string;
    content: string;
    authorId?: number;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
    deleteReason: string;
    author?: User;
    renderedContent?: string;
}
