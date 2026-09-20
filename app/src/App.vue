<script setup lang="ts">
// App 生命周期将在后续服务端与推送切片中接入。
</script>

<style>
@import './styles/tokens.css';

page {
  min-height: 100%;
  background: var(--sg-background);
  color: var(--sg-ink);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
}

view,
text,
button {
  box-sizing: border-box;
}

button::after {
  border: 0;
}
</style>
