<script setup lang="ts">
const props = withDefaults(defineProps<{
  name: 'home' | 'shield-check' | 'sos' | 'heart' | 'users' | 'calendar' | 'pill' | 'mic' | 'bell' | 'user' | 'phone' | 'clock';
  size?: number;
  label?: string;
}>(), {
  size: 24,
  label: '',
});

const source = `/static/icons/${props.name}.svg`;
</script>

<template>
  <image
    class="sg-icon"
    :src="source"
    mode="aspectFit"
    :style="{ width: `${size}px`, height: `${size}px` }"
    :aria-hidden="label ? 'false' : 'true'"
    :aria-label="label || undefined"
  />
</template>

<style scoped>
.sg-icon {
  display: block;
  flex: 0 0 auto;
  opacity: 0.94;
}
</style>
