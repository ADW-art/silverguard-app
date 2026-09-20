<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'risk';
  disabled?: boolean;
}>(), {
  variant: 'primary',
  disabled: false,
});

defineEmits<{ press: [] }>();
</script>

<template>
  <button
    class="sg-button"
    :class="`sg-button--${variant}`"
    :disabled="disabled"
    @click="$emit('press')"
  >
    <slot />
  </button>
</template>

<style scoped>
.sg-button {
  min-height: 56px;
  margin: 0;
  padding: 0 22px;
  border: 0;
  border-radius: var(--sg-radius-button);
  font-size: 18px;
  font-weight: 650;
  line-height: 56px;
  transition: transform 160ms ease, opacity 160ms ease, box-shadow 160ms ease;
}

.sg-button:active { transform: translateY(1px) scale(0.99); }

.sg-button--primary {
  color: var(--sg-surface);
  background: linear-gradient(135deg, var(--sg-ink), #4a3821);
  box-shadow: 0 9px 20px rgba(35, 30, 23, 0.18), inset 0 1px rgba(255, 255, 255, 0.2);
}

.sg-button--secondary {
  color: var(--sg-ink);
  background: rgba(255, 253, 248, 0.94);
  border: 1px solid var(--sg-border);
  box-shadow: var(--sg-shadow-soft);
}

.sg-button--risk {
  color: #fffdf8;
  background: linear-gradient(135deg, #c74a40, var(--sg-risk));
  box-shadow: 0 9px 20px rgba(163, 58, 50, 0.2);
}

.sg-button[disabled] { opacity: 0.48; }
</style>
