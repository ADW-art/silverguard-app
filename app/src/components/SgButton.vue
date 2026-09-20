<script setup lang="ts">
import { triggerHaptic } from '@/features/feedback/haptics';

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'risk';
  disabled?: boolean;
  loading?: boolean;
  haptic?: boolean;
}>(), {
  variant: 'primary',
  disabled: false,
  loading: false,
  haptic: false,
});

const emit = defineEmits<{ press: [] }>();

function press() {
  if (props.disabled || props.loading) return;
  if (props.haptic) triggerHaptic('light');
  emit('press');
}
</script>

<template>
  <button
    class="sg-button"
    :class="`sg-button--${variant}`"
    :disabled="disabled || loading"
    :aria-busy="loading"
    @click="press"
  >
    <view v-if="loading" class="sg-button__spinner" />
    <slot v-else />
  </button>
</template>

<style scoped>
.sg-button {
  min-height: 56px;
  margin: 0;
  padding: 0 22px;
  border: 0;
  border-radius: var(--sg-radius-button);
  overflow: hidden;
  font-size: 18px;
  font-weight: 680;
  line-height: 56px;
  letter-spacing: 0.2px;
  transform: translateZ(0);
  transition:
    transform var(--sg-motion-fast) var(--sg-ease-standard),
    opacity var(--sg-motion-fast) ease,
    filter var(--sg-motion-fast) ease,
    box-shadow var(--sg-motion-fast) var(--sg-ease-standard);
}

.sg-button::after { display: none; border: 0; }
.sg-button:active { transform: scale(var(--sg-press-scale)); filter: brightness(.96); box-shadow: var(--sg-shadow-pressed); }

.sg-button--primary {
  color: var(--sg-surface);
  background: linear-gradient(145deg, #4b3825 0%, var(--sg-coffee) 52%, #261c13 100%);
  box-shadow: var(--sg-shadow-dark);
}

.sg-button--secondary {
  color: var(--sg-ink);
  background: linear-gradient(160deg, var(--sg-surface-raised), #f8efdf);
  border: 1px solid var(--sg-border);
  box-shadow: var(--sg-shadow-soft);
}

.sg-button--risk {
  color: #fffdf8;
  background: linear-gradient(145deg, #c9574d, var(--sg-risk));
  box-shadow: 0 9px 20px rgba(163, 58, 50, 0.2);
}

.sg-button[disabled] { opacity: 0.48; }

.sg-button__spinner {
  width: 22px;
  height: 22px;
  margin: 17px auto;
  border: 3px solid rgba(255,255,255,.35);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: sg-button-spin .8s linear infinite;
}

@keyframes sg-button-spin { to { transform: rotate(360deg); } }
</style>
