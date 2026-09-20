<script setup lang="ts">
import { computed, ref } from 'vue';
import SgIcon from '@/components/SgIcon.vue';
import {
  calculateResult,
  createCalculatorState,
  inputCalculatorDecimal,
  inputCalculatorDigit,
  selectCalculatorOperator,
  toggleCalculatorSign,
  type CalculatorOperator,
} from '@/features/life/calculator';

const state = ref(createCalculatorState());
const expression = computed(() => state.value.operator && state.value.storedValue !== null
  ? `${state.value.storedValue} ${state.value.operator}`
  : ' ');

function goBack() {
  uni.navigateBack();
}

function clear() {
  state.value = createCalculatorState();
}

function digit(value: string) {
  state.value = inputCalculatorDigit(state.value, value);
}

function decimal() {
  state.value = inputCalculatorDecimal(state.value);
}

function operator(value: CalculatorOperator) {
  state.value = selectCalculatorOperator(state.value, value);
}

function equals() {
  state.value = calculateResult(state.value);
}

function toggleSign() {
  state.value = toggleCalculatorSign(state.value);
}
</script>

<template>
  <view class="calculator-page">
    <view class="ambient ambient--gold" />
    <view class="page-header">
      <button class="back-button" aria-label="返回" @click="goBack"><SgIcon name="chevron-left" :size="25" /></button>
      <text class="page-title">大字计算器</text>
      <view class="header-space" />
    </view>

    <view class="display-card" :class="{ 'display-card--error': state.error }">
      <view class="display-mark"><SgIcon name="calculator" :size="25" /></view>
      <text class="expression">{{ expression }}</text>
      <text class="display-value">{{ state.display }}</text>
    </view>

    <view class="keypad">
      <button class="key key--utility" @click="clear">清除</button>
      <button class="key key--utility" @click="toggleSign">±</button>
      <button class="key key--operator" @click="operator('÷')">÷</button>
      <button class="key key--operator" @click="operator('×')">×</button>

      <button class="key" @click="digit('7')">7</button>
      <button class="key" @click="digit('8')">8</button>
      <button class="key" @click="digit('9')">9</button>
      <button class="key key--operator" @click="operator('-')">−</button>

      <button class="key" @click="digit('4')">4</button>
      <button class="key" @click="digit('5')">5</button>
      <button class="key" @click="digit('6')">6</button>
      <button class="key key--operator" @click="operator('+')">+</button>

      <button class="key" @click="digit('1')">1</button>
      <button class="key" @click="digit('2')">2</button>
      <button class="key" @click="digit('3')">3</button>
      <button class="key key--equals" @click="equals">=</button>

      <button class="key key--zero" @click="digit('0')">0</button>
      <button class="key" @click="decimal">.</button>
    </view>
  </view>
</template>

<style scoped>
.calculator-page { position:relative; min-height:100vh; padding:calc(env(safe-area-inset-top) + 16px) 20px calc(env(safe-area-inset-bottom) + 24px); overflow:hidden; background:radial-gradient(circle at 84% 6%,rgba(245,218,157,.5),transparent 27%),linear-gradient(160deg,#f9f3e8 0%,var(--sg-background) 58%,#efe4d1 100%); }
.ambient { position:absolute; border-radius:50%; filter:blur(54px); pointer-events:none; opacity:.72; }
.ambient--gold { width:220px; height:220px; top:-82px; right:-84px; background:rgba(229,186,93,.3); }
.page-header { position:relative; z-index:1; display:grid; grid-template-columns:48px 1fr 48px; align-items:center; min-height:48px; animation:calc-rise var(--sg-motion-emphasized) var(--sg-ease-emphasized) both; }
.back-button { display:grid; place-items:center; width:48px; height:48px; margin:0; padding:0; border:1px solid var(--sg-border); border-radius:16px; background:linear-gradient(155deg,rgba(255,253,248,.94),rgba(242,233,218,.9)); box-shadow:0 7px 18px rgba(69,52,31,.08),inset 0 1px var(--sg-highlight); transition:transform var(--sg-motion-fast) var(--sg-ease-standard),box-shadow var(--sg-motion-fast) ease; }
.back-button::after,.key::after { display:none; border:0; }
.back-button:active { transform:scale(.94); box-shadow:var(--sg-shadow-pressed); }
.page-title { font-size:22px; font-weight:750; text-align:center; }
.header-space { width:48px; }
.display-card { position:relative; z-index:1; display:flex; flex-direction:column; align-items:flex-end; min-height:158px; margin-top:18px; padding:19px 22px 20px; overflow:hidden; border:1px solid rgba(130,91,31,.16); border-radius:26px; background:radial-gradient(circle at 84% 8%,rgba(255,255,255,.5),transparent 28%),linear-gradient(138deg,#faeac2 0%,#edca7e 58%,#dcb25e 100%); box-shadow:var(--sg-shadow),inset 0 1px var(--sg-highlight); animation:calc-rise var(--sg-motion-emphasized) 45ms var(--sg-ease-emphasized) both; }
.display-card--error { border-color:rgba(163,58,50,.18); background:radial-gradient(circle at 84% 8%,rgba(255,255,255,.46),transparent 28%),linear-gradient(138deg,#fee8df,#f2c6bc); }
.display-mark { position:absolute; top:18px; left:20px; display:grid; place-items:center; width:44px; height:44px; border-radius:14px; background:rgba(255,249,234,.64); box-shadow:inset 0 1px rgba(255,255,255,.62),0 7px 18px rgba(111,78,31,.1); }
.expression { min-height:30px; color:#685334; font-size:18px; font-weight:650; }
.display-value { display:block; max-width:100%; margin-top:auto; overflow:hidden; color:var(--sg-ink); font-size:48px; font-weight:780; letter-spacing:-1px; line-height:1.05; text-overflow:ellipsis; white-space:nowrap; }
.display-card--error .display-value { color:var(--sg-risk); font-size:35px; }
.keypad { position:relative; z-index:1; display:grid; grid-template-columns:repeat(4,1fr); grid-auto-rows:66px; gap:10px; margin-top:20px; animation:calc-rise var(--sg-motion-emphasized) 100ms var(--sg-ease-emphasized) both; }
.key { display:grid; place-items:center; min-width:0; min-height:66px; margin:0; padding:0; border:1px solid var(--sg-border); border-radius:19px; color:var(--sg-ink); background:linear-gradient(155deg,rgba(255,253,248,.97),rgba(244,234,216,.95)); box-shadow:var(--sg-shadow-soft),inset 0 1px var(--sg-highlight); font-size:25px; font-weight:720; line-height:66px; transition:transform var(--sg-motion-fast) var(--sg-ease-standard),box-shadow var(--sg-motion-fast) ease,filter var(--sg-motion-fast) ease; }
.key:active { transform:scale(.94); box-shadow:var(--sg-shadow-pressed); filter:brightness(.97); }
.key--utility { font-size:18px; background:linear-gradient(150deg,#f7f4ec,#e6ddce); }
.key--operator { color:var(--sg-gold-deep); background:linear-gradient(150deg,#fff4d6,#edcf8a); }
.key--equals { grid-column:4; grid-row:4 / 6; color:#fffaf1; background:linear-gradient(145deg,#4b3825 0%,var(--sg-coffee) 52%,#261c13 100%); box-shadow:var(--sg-shadow-dark); font-size:30px; }
.key--zero { grid-column:1 / 3; }
@keyframes calc-rise { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
@media (min-width:600px) { .calculator-page { left:50%; width:430px; margin-left:-215px; box-shadow:0 0 40px rgba(35,30,23,.09); } }
</style>
