import { reactive } from 'vue';

export type GlassToastType = 'success' | 'error' | 'warning' | 'info';

export interface GlassToastRecord {
    id: number;
    type: GlassToastType;
    text: string;
    /** 已在离场：宿主据此收起它，动画放完后由 `removeGlassToast` 真正删掉。 */
    closing: boolean;
}

/** 停留时长，与 naive-ui 的 message 默认值一致。 */
const DURATION = 3000;

/** 由 `GlassToastHost` 渲染的队列，最后一条画在最下面。 */
export const glassToastStack = reactive<GlassToastRecord[]>([]);

const timers = new Map<number, number>();
let nextId = 0;

function push(type: GlassToastType, text: string): { destroy: () => void } {
    const id = nextId++;
    glassToastStack.push({ id, type, text, closing: false });
    timers.set(
        id,
        window.setTimeout(() => dismissGlassToast(id), DURATION)
    );
    return { destroy: () => dismissGlassToast(id) };
}

/** 开始离场；停留时间没走完就被点掉时，计时器一并清掉。 */
export function dismissGlassToast(id: number): void {
    const timer = timers.get(id);
    if (timer !== undefined) {
        window.clearTimeout(timer);
        timers.delete(id);
    }
    const toast = glassToastStack.find(item => item.id === id);
    if (toast) toast.closing = true;
}

export function removeGlassToast(id: number): void {
    const index = glassToastStack.findIndex(toast => toast.id === id);
    if (index >= 0) glassToastStack.splice(index, 1);
}

const glassToast = {
    success: (text: string) => push('success', text),
    error: (text: string) => push('error', text),
    warning: (text: string) => push('warning', text),
    info: (text: string) => push('info', text)
};

export function useGlassToast(): typeof glassToast {
    return glassToast;
}
