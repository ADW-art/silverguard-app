<script setup lang="ts">
// App 生命周期将在后续服务端与推送切片中接入。
</script>

<style>
@import './styles/tokens.css';

page {
  min-height: 100%;
  background:
    radial-gradient(circle at 88% 4%, rgba(239, 207, 136, 0.34), transparent 28%),
    linear-gradient(160deg, var(--sg-background) 0%, #f8f2e8 58%, var(--sg-background-deep) 100%);
  color: var(--sg-ink);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  text-rendering: optimizeLegibility;
}

view,
text,
button {
  box-sizing: border-box;
  border: 0;
  outline: 0;
  -webkit-tap-highlight-color: transparent;
}

button::after {
  border: 0;
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 1ms !important;
    animation-delay: 0ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
  }
}
</style>
