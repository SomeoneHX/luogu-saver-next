<script setup lang="ts">
/** 渲染 `useGlassDialog()` 推入队列的对话框，一条一层。挂在 `App` 里一次即可。 */
import { NButton } from 'naive-ui';

import GlassDialog from '@/components/GlassDialog.vue';
import {
    clickGlassDialogNegative,
    clickGlassDialogPositive,
    dismissGlassDialog,
    glassDialogStack,
    type GlassDialogRecord
} from '@/composables/useGlassDialog.ts';

const buttonTypes = {
    info: 'primary',
    success: 'success',
    warning: 'warning',
    error: 'error'
} as const;

const buttonType = (dialog: GlassDialogRecord) => buttonTypes[dialog.type];
</script>

<template>
    <GlassDialog
        v-for="dialog in glassDialogStack"
        :key="dialog.id"
        :show="true"
        :title="dialog.title"
        :close-on-esc="dialog.closeOnEsc"
        :mask-closable="dialog.maskClosable"
        @update:show="value => !value && dismissGlassDialog(dialog.id)"
    >
        <p v-if="dialog.content" class="glass-dialog-host__text">{{ dialog.content }}</p>

        <template #footer>
            <n-button v-if="dialog.negativeText" @click="clickGlassDialogNegative(dialog.id)">
                {{ dialog.negativeText }}
            </n-button>
            <n-button
                :type="buttonType(dialog)"
                :loading="dialog.loading"
                @click="clickGlassDialogPositive(dialog.id)"
            >
                {{ dialog.positiveText }}
            </n-button>
        </template>
    </GlassDialog>
</template>

<style scoped>
.glass-dialog-host__text {
    margin: 0;
    font-size: 15px;
    line-height: 1.5;
}
</style>
