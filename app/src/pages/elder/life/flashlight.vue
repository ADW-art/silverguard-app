<script setup lang="ts">
import { computed, ref } from 'vue';
import { onHide, onShow, onUnload } from '@dcloudio/uni-app';
import SgIcon from '@/components/SgIcon.vue';
import { triggerHaptic } from '@/features/feedback/haptics';
import { FlashlightController, flashlightMessage } from '@/features/life/flashlight';
import { createPlatformFlashlightDriver } from '@/features/life/flashlight-native';

type ViewState = 'off' | 'turning-on' | 'on' | 'error';

const controller = new FlashlightController(createPlatformFlashlightDriver());
const state = ref<ViewState>('off');
const message = ref('点击下方按钮打开手电筒');
let visible = true;

const buttonText = computed(() => {
  if (state.value === 'turning-on') return '正在打开';
  if (state.value === 'on') return '关闭手电筒';
  if (state.value === 'error') return '再试一次';
  return '打开手电筒';
});

function goBack() {
  uni.navigateBack();
}

async function toggle() {
  if (state.value === 'turning-on') return;
  if (state.value === 'on') {
    await turnOff();
    return;
  }
  state.value = 'turning-on';
  message.value = '正在连接手机闪光灯';
  try {
    const remainedOn = await controller.turnOn();
    if (!visible || !remainedOn) {
      state.value = 'off';
      message.value = '手电筒已关闭';
      return;
    }
    state.value = 'on';
    message.value = '手电筒已打开';
    triggerHaptic('success');
  } catch (error) {
    state.value = 'error';
    message.value = flashlightMessage(error);
    triggerHaptic('warning');
  }
}

async function turnOff() {
  try {
    await controller.turnOff();
  } catch {
    // 页面状态仍回到关闭，避免用户误以为 App 继续持有闪光灯。
  }
  state.value = 'off';
  message.value = '手电筒已关闭';
}

function releaseTorch() {
  visible = false;
  void controller.turnOff().catch(() => undefined);
  state.value = 'off';
}

onHide(releaseTorch);
onShow(() => {
  visible = true;
});
onUnload(releaseTorch);
</script>

<template>
  <view class="flashlight-page" :class="{ 'flashlight-page--on': state === 'on' }">
    <view class="ambient ambient--gold" />
    <view class="page-header">
      <button class="back-button" aria-label="返回" @click="goBack"><SgIcon name="chevron-left" :size="25" /></button>
      <text class="page-title">手电筒</text>
      <view class="header-space" />
    </view>

    <view class="torch-stage">
      <view class="light-halo" />
      <view class="torch-icon"><SgIcon name="flashlight" :size="70" /></view>
      <text class="status-title">{{ state === 'on' ? '手电已打开' : state === 'error' ? '暂时无法打开' : '手电已关闭' }}</text>
      <text class="status-message">{{ message }}</text>
    </view>

    <button
      class="torch-button"
      :class="{ 'torch-button--on': state === 'on' }"
      :disabled="state === 'turning-on'"
      @click="toggle"
    >
      <SgIcon name="flashlight" :size="24" />
      <text>{{ buttonText }}</text>
    </button>

    <text class="safety-note">离开页面时会自动关闭</text>
  </view>
</template>

<style scoped>
.flashlight-page { position:relative; min-height:100vh; padding:calc(env(safe-area-inset-top) + 16px) 20px calc(env(safe-area-inset-bottom) + 28px); overflow:hidden; background:radial-gradient(circle at 84% 6%,rgba(245,218,157,.5),transparent 27%),linear-gradient(160deg,#f9f3e8 0%,var(--sg-background) 58%,#efe4d1 100%); transition:background var(--sg-motion-emphasized) ease; }
.flashlight-page--on { background:radial-gradient(circle at 50% 36%,rgba(255,238,183,.72),transparent 34%),linear-gradient(160deg,#f9f3e8 0%,#f2e3c4 58%,#e8d4af 100%); }
.ambient { position:absolute; border-radius:50%; filter:blur(54px); pointer-events:none; opacity:.72; }
.ambient--gold { width:220px; height:220px; top:-82px; right:-84px; background:rgba(229,186,93,.3); }
.page-header { position:relative; z-index:2; display:grid; grid-template-columns:48px 1fr 48px; align-items:center; min-height:48px; animation:torch-rise var(--sg-motion-emphasized) var(--sg-ease-emphasized) both; }
.back-button { display:grid; place-items:center; width:48px; height:48px; margin:0; padding:0; border:1px solid var(--sg-border); border-radius:16px; background:linear-gradient(155deg,rgba(255,253,248,.94),rgba(242,233,218,.9)); box-shadow:0 7px 18px rgba(69,52,31,.08),inset 0 1px var(--sg-highlight); transition:transform var(--sg-motion-fast) var(--sg-ease-standard),box-shadow var(--sg-motion-fast) ease; }
.back-button::after,.torch-button::after { display:none; border:0; }
.back-button:active { transform:scale(.94); box-shadow:var(--sg-shadow-pressed); }
.page-title { font-size:22px; font-weight:750; text-align:center; }
.header-space { width:48px; }
.torch-stage { position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; min-height:430px; padding-top:74px; }
.light-halo { position:absolute; top:38px; left:50%; width:260px; height:260px; margin-left:-130px; border:1px solid rgba(151,105,37,.12); border-radius:50%; background:radial-gradient(circle,rgba(255,240,194,.28) 0%,rgba(237,202,126,.13) 43%,transparent 70%); transition:transform var(--sg-motion-emphasized) var(--sg-ease-emphasized),opacity var(--sg-motion-standard) ease,background var(--sg-motion-standard) ease; }
.flashlight-page--on .light-halo { transform:scale(1.14); background:radial-gradient(circle,rgba(255,244,201,.84) 0%,rgba(237,202,126,.35) 42%,transparent 72%); }
.torch-icon { position:relative; display:grid; place-items:center; width:156px; height:156px; border:1px solid rgba(128,89,31,.16); border-radius:48px; color:var(--sg-gold-deep); background:radial-gradient(circle at 34% 24%,rgba(255,255,255,.76),transparent 32%),linear-gradient(145deg,#fff5d7,#e8c474); box-shadow:0 26px 56px rgba(91,64,29,.17),inset 0 1px rgba(255,255,255,.64); transition:transform var(--sg-motion-emphasized) var(--sg-ease-emphasized),box-shadow var(--sg-motion-standard) ease; }
.flashlight-page--on .torch-icon { transform:translateY(-3px); box-shadow:0 30px 72px rgba(155,109,32,.25),0 0 52px rgba(232,190,89,.26),inset 0 1px rgba(255,255,255,.7); }
.status-title { position:relative; margin-top:38px; font-size:28px; font-weight:770; }
.status-message { position:relative; max-width:280px; margin-top:10px; color:var(--sg-secondary); font-size:17px; line-height:1.55; text-align:center; }
.torch-button { position:relative; z-index:2; display:flex; align-items:center; justify-content:center; gap:10px; width:100%; height:58px; margin:14px 0 0; padding:0 18px; border:0; border-radius:19px; color:#fffaf1; background:linear-gradient(145deg,#4b3825 0%,var(--sg-coffee) 52%,#261c13 100%); box-shadow:var(--sg-shadow-dark); font-size:19px; font-weight:740; transition:transform var(--sg-motion-fast) var(--sg-ease-standard),box-shadow var(--sg-motion-fast) ease,filter var(--sg-motion-fast) ease; }
.torch-button--on { color:#3d2b13; background:linear-gradient(145deg,#f9e5ac,#dfb65e); box-shadow:0 15px 32px rgba(111,78,31,.18),inset 0 1px rgba(255,255,255,.58); }
.torch-button:active { transform:scale(var(--sg-press-scale)); box-shadow:var(--sg-shadow-pressed); filter:brightness(.97); }
.torch-button[disabled] { opacity:.72; }
.safety-note { position:relative; z-index:1; display:block; margin-top:15px; color:var(--sg-secondary); font-size:14px; text-align:center; }
@keyframes torch-rise { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
@media (min-width:600px) { .flashlight-page { left:50%; width:430px; margin-left:-215px; box-shadow:0 0 40px rgba(35,30,23,.09); } }
</style>
