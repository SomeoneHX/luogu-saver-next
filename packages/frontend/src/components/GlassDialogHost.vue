<script setup lang="ts">
/** 渲染 `useGlassDialog()` 推入队列的对话框，一条一层。挂在 `App` 里一次即可。 */
import GlassDialog from '@/components/GlassDialog.vue';
import GlassDialogButton from '@/components/GlassDialogButton.vue';
import {
    clickGlassDialogNegative,
    clickGlassDialogPositive,
    dismissGlassDialog,
    glassDialogStack
} from '@/composables/useGlassDialog.ts';
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
            <GlassDialogButton
                v-if="dialog.negativeText"
                variant="plain"
                @click="clickGlassDialogNegative(dialog.id)"
            >
                {{ dialog.negativeText }}
            </GlassDialogButton>
            <GlassDialogButton
                :loading="dialog.loading"
                @click="clickGlassDialogPositive(dialog.id)"
            >
                {{ dialog.positiveText }}
            </GlassDialogButton>
        </template>
    </GlassDialog>
</template>

<style scoped>
.glass-dialog-host__text {
    margin: 0;
    font-size: 15px;
    line-height: 1.4;
    /* 上游把正文降一档不透明度，读作次要信息。 */
    opacity: 0.68;
}
</style>
