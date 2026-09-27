import { reactive } from 'vue';

export type GlassDialogType = 'info' | 'success' | 'warning' | 'error';

export interface GlassDialogOptions {
    title?: string;
    content?: string;
    positiveText?: string;
    negativeText?: string;
    closeOnEsc?: boolean;
    maskClosable?: boolean;
    /**
     * 按钮回调；返回 Promise 时按钮进入 loading，resolve 出 `false` 则对话框保持打开，
     * 其余情况关闭。与 naive-ui 的 `useDialog` 同一套语义。
     */
    onPositiveClick?: () => unknown;
    onNegativeClick?: () => unknown;
}

export interface GlassDialogRecord {
    id: number;
    type: GlassDialogType;
    title: string;
    content: string;
    positiveText: string;
    negativeText: string;
    closeOnEsc: boolean;
    maskClosable: boolean;
    loading: boolean;
    onPositiveClick?: () => unknown;
    onNegativeClick?: () => unknown;
}

/** 由 `GlassDialogHost` 渲染的队列；队列里的每一条都自己画一层压暗。 */
export const glassDialogStack = reactive<GlassDialogRecord[]>([]);

let nextId = 0;

function open(type: GlassDialogType, options: GlassDialogOptions): { destroy: () => void } {
    const id = nextId++;
    glassDialogStack.push({
        id,
        type,
        title: options.title ?? '',
        content: options.content ?? '',
        positiveText: options.positiveText ?? '确定',
        negativeText: options.negativeText ?? '',
        closeOnEsc: options.closeOnEsc ?? true,
        maskClosable: options.maskClosable ?? true,
        loading: false,
        onPositiveClick: options.onPositiveClick,
        onNegativeClick: options.onNegativeClick
    });
    return { destroy: () => dismissGlassDialog(id) };
}

export function dismissGlassDialog(id: number): void {
    const index = glassDialogStack.findIndex(dialog => dialog.id === id);
    if (index >= 0) glassDialogStack.splice(index, 1);
}

async function runHandler(
    id: number,
    pick: (dialog: GlassDialogRecord) => (() => unknown) | undefined
) {
    const dialog = glassDialogStack.find(item => item.id === id);
    if (!dialog || dialog.loading) return;

    let result: unknown;
    try {
        result = pick(dialog)?.();
        if (result instanceof Promise) {
            dialog.loading = true;
            result = await result;
        }
    } catch {
        // 回调自己负责报错（调用点都在内部 try/catch 并弹 message）；这里只保证按钮恢复可用。
        dialog.loading = false;
        return;
    }
    dialog.loading = false;
    if (result === false) return;
    dismissGlassDialog(id);
}

export function clickGlassDialogPositive(id: number): void {
    void runHandler(id, dialog => dialog.onPositiveClick);
}

export function clickGlassDialogNegative(id: number): void {
    void runHandler(id, dialog => dialog.onNegativeClick);
}

const glassDialog = {
    info: (options: GlassDialogOptions) => open('info', options),
    success: (options: GlassDialogOptions) => open('success', options),
    warning: (options: GlassDialogOptions) => open('warning', options),
    error: (options: GlassDialogOptions) => open('error', options)
};

export function useGlassDialog(): typeof glassDialog {
    return glassDialog;
}
