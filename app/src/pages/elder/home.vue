<script setup lang="ts">
import { onHide, onUnload } from '@dcloudio/uni-app';
import SgButton from '@/components/SgButton.vue';
import { createMockSosGateway } from '@/features/sos/gateway';
import { useSosFlow } from '@/features/sos/useSosFlow';

const configuredOutcome = import.meta.env.VITE_SOS_DEMO_OUTCOME;
const demoOutcome = configuredOutcome === 'timeout' || configuredOutcome === 'failure'
  ? configuredOutcome
  : 'claimed';
const gateway = createMockSosGateway({ outcome: demoOutcome });
const {
  state,
  holdProgress,
  remainingSeconds,
  overlayVisible,
  startHold,
  cancelHold,
  retry,
  reset,
  dispose,
} = useSosFlow(gateway);

let touchInputActive = false;
let touchReleaseTimer: ReturnType<typeof setTimeout> | null = null;

function beginTouchHold() {
  touchInputActive = true;
  startHold();
}

function endTouchHold() {
  cancelHold();
  if (touchReleaseTimer) clearTimeout(touchReleaseTimer);
  touchReleaseTimer = setTimeout(() => {
    touchInputActive = false;
  }, 400);
}

function beginMouseHold() {
  if (!touchInputActive) startHold();
}

function endMouseHold() {
  if (!touchInputActive) cancelHold();
}

function showContact() {
  uni.showToast({ title: '演示模式：未拨打电话', icon: 'none', duration: 2200 });
}

function showEmergencyCall() {
  uni.showModal({
    title: '拨打紧急电话',
    content: '当前为本地演示模式，不会发起真实电话。接入真机权限后再启用拨号。',
    showCancel: false,
    confirmText: '我知道了',
  });
}

function reportSafe() {
  uni.showToast({ title: '已记录今日平安', icon: 'success' });
}

function announceVoicePlaceholder() {
  uni.showToast({ title: '语音功能将在后续切片接入', icon: 'none' });
}

onHide(cancelHold);
onUnload(() => {
  if (touchReleaseTimer) clearTimeout(touchReleaseTimer);
  dispose();
});
</script>

<template>
  <view class="page-shell">
    <view class="ambient ambient--gold" />
    <view class="ambient ambient--blush" />

    <view class="top-row">
      <view>
        <text class="eyebrow">银龄智护</text>
        <text class="greeting">嗨，王叔</text>
      </view>
      <view class="status-pill"><view class="status-dot" /><text>守护中</text></view>
    </view>

    <view class="hero-card">
      <view>
        <text class="hero-title">今日安好</text>
        <text class="hero-copy">家人已收到您的平安状态</text>
      </view>
      <view class="guard-ring"><view class="guard-check" /></view>
    </view>

    <view class="action-grid">
      <!-- #ifdef H5 -->
      <div
        class="home-action home-action--sos"
        role="button"
        tabindex="0"
        aria-label="长按三秒发送求助"
        @touchstart.stop.prevent="beginTouchHold"
        @touchend.stop.prevent="endTouchHold"
        @touchcancel.stop.prevent="endTouchHold"
        @mousedown="beginMouseHold"
        @mouseup="endMouseHold"
        @mouseleave="endMouseHold"
        @pointerdown="beginMouseHold"
        @pointerup="endMouseHold"
        @pointercancel="endMouseHold"
        @pointerleave="endMouseHold"
        @keydown.space.prevent="beginMouseHold"
        @keyup.space.prevent="endMouseHold"
        @contextmenu.prevent
      >
        <text class="action-mark">SOS</text>
        <text class="action-title">长按求助</text>
      </div>
      <!-- #endif -->
      <!-- #ifndef H5 -->
      <button
        class="home-action home-action--sos"
        aria-label="长按三秒发送求助"
        @touchstart.stop.prevent="beginTouchHold"
        @touchend.stop.prevent="endTouchHold"
        @touchcancel.stop.prevent="endTouchHold"
        @contextmenu.prevent
      >
        <text class="action-mark">SOS</text>
        <text class="action-title">长按求助</text>
      </button>
      <!-- #endif -->
      <button class="home-action home-action--gold" @click="reportSafe">
        <text class="action-mark">✓</text>
        <text class="action-title">一键报平安</text>
      </button>
      <button class="home-action" @click="showContact">
        <text class="action-mark action-mark--green">家</text>
        <text class="action-title">联系家人</text>
      </button>
      <button class="home-action">
        <text class="action-mark action-mark--green">日</text>
        <text class="action-title">生活工具</text>
      </button>
    </view>

    <view class="medicine-card">
      <view class="medicine-icon">药</view>
      <view class="medicine-copy">
        <text class="medicine-title">降压药 · 1 片</text>
        <text class="medicine-time">今天 12:00</text>
      </view>
      <button class="medicine-action">查看</button>
    </view>

    <SgButton class="voice-button" @press="announceVoicePlaceholder">
      按住说话
    </SgButton>

    <text class="demo-note">演示模式 · 当前不会发送真实通知</text>

    <view class="bottom-nav">
      <view class="nav-item nav-item--active"><text class="nav-mark">首</text><text>首页</text></view>
      <view class="nav-item"><text class="nav-mark">生</text><text>生活</text></view>
      <view class="nav-item"><text class="nav-mark">消</text><text>消息</text></view>
      <view class="nav-item"><text class="nav-mark">我</text><text>我的</text></view>
    </view>

    <view v-if="overlayVisible" class="sos-overlay">
      <view class="sos-topbar"><text>紧急求助</text></view>

      <view v-if="state.phase === 'holding'" class="sos-state sos-state--center">
        <text class="sos-kicker">继续按住</text>
        <view
          class="holding-ring"
          :style="{ background: `conic-gradient(var(--sg-risk) ${holdProgress * 3.6}deg, rgba(163,58,50,.12) 0deg)` }"
        >
          <view class="holding-ring__inner"><text>{{ remainingSeconds }}</text></view>
        </view>
        <text class="state-help">松开即可取消</text>
        <SgButton variant="secondary" class="state-button" @press="cancelHold">取消求助</SgButton>
      </view>

      <view v-else-if="state.phase === 'sending'" class="sos-state sos-state--center">
        <view class="sending-ring"><view class="sending-dot" /></view>
        <text class="state-title">正在发送求助</text>
        <text class="state-help">请稍候，不需要重复操作</text>
      </view>

      <view v-else-if="state.phase === 'waiting'" class="sos-state sos-state--center">
        <view class="waiting-ring"><text>✓</text></view>
        <text class="state-title">已通知家人</text>
        <text class="state-help">正在等待家人接管</text>
        <view class="progress-card">
          <view class="progress-row"><view class="progress-dot progress-dot--done" /><text>女儿 · 已送达</text></view>
          <view class="progress-row"><view class="progress-dot" /><text>其他家人 · 等待查看</text></view>
        </view>
        <SgButton class="state-button" @press="showContact">直接联系家人</SgButton>
      </view>

      <view v-else-if="state.phase === 'claimed'" class="sos-state">
        <view class="result-card result-card--safe">
          <view class="result-icon">✓</view>
          <text class="result-title">{{ state.claimantName }}已接管</text>
          <text class="result-copy">她正在联系您</text>
        </view>
        <view class="family-card">
          <view class="avatar">女</view>
          <view><text class="family-name">{{ state.claimantName }} · 女儿</text><text class="family-meta">刚刚接管</text></view>
        </view>
        <SgButton class="state-button" @press="showContact">拨打女儿电话</SgButton>
        <SgButton variant="secondary" class="state-button state-button--secondary" @press="reset">返回首页</SgButton>
      </view>

      <view v-else-if="state.phase === 'no-response'" class="sos-state">
        <view class="result-card result-card--risk">
          <view class="result-icon result-icon--risk">!</view>
          <text class="result-title result-title--risk">暂时无人响应</text>
          <text class="result-copy">请继续尝试联系</text>
        </view>
        <view class="plain-card"><text class="plain-title">求助仍在发送</text><text class="plain-copy">家人看到后仍可接管</text></view>
        <SgButton class="state-button" @press="retry">再次联系家人</SgButton>
        <SgButton variant="risk" class="state-button state-button--secondary" @press="showEmergencyCall">拨打紧急电话</SgButton>
        <button class="text-action" @click="reset">返回首页</button>
      </view>

      <view v-else-if="state.phase === 'failed'" class="sos-state">
        <view class="result-card result-card--risk">
          <view class="result-icon result-icon--risk">!</view>
          <text class="result-title result-title--risk">求助暂时未发送</text>
          <text class="result-copy">{{ state.errorMessage }}</text>
        </view>
        <SgButton class="state-button" @press="retry">重新发送</SgButton>
        <SgButton variant="risk" class="state-button state-button--secondary" @press="showEmergencyCall">拨打紧急电话</SgButton>
        <button class="text-action" @click="reset">返回首页</button>
      </view>

      <text class="overlay-demo-note">本地演示状态 · 未产生真实通知</text>
    </view>
  </view>
</template>

<style scoped>
.page-shell {
  position: relative;
  min-height: 100vh;
  padding: calc(env(safe-area-inset-top) + 18px) 20px calc(env(safe-area-inset-bottom) + 92px);
  overflow: hidden;
  background: var(--sg-background);
}

.ambient { position: absolute; border-radius: 50%; filter: blur(46px); pointer-events: none; }
.ambient--gold { width: 190px; height: 190px; top: -58px; right: -72px; background: rgba(243, 215, 154, 0.54); }
.ambient--blush { width: 150px; height: 150px; left: -92px; top: 430px; background: rgba(250, 209, 200, 0.32); }

.top-row { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.eyebrow { display: block; margin-bottom: 3px; color: var(--sg-gold-deep); font-size: 13px; font-weight: 650; letter-spacing: 1px; }
.greeting { display: block; font-size: 26px; font-weight: 750; }
.status-pill { display: flex; align-items: center; gap: 7px; padding: 9px 13px; border-radius: 999px; color: var(--sg-safe); background: rgba(255,253,248,.84); border: 1px solid rgba(255,255,255,.82); box-shadow: var(--sg-shadow-soft); font-size: 14px; font-weight: 650; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--sg-safe); }

.hero-card { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; min-height: 124px; padding: 22px; border-radius: var(--sg-radius-hero); background: linear-gradient(135deg, var(--sg-gold-pale), var(--sg-champagne)); border: 1px solid rgba(255,255,255,.44); box-shadow: var(--sg-shadow); }
.hero-title { display: block; margin-bottom: 9px; font-size: 27px; font-weight: 760; }
.hero-copy { display: block; max-width: 200px; color: #5d4b2f; font-size: 15px; line-height: 1.5; }
.guard-ring { display: grid; place-items: center; width: 66px; height: 66px; border: 1px solid rgba(134,92,28,.3); border-radius: 50%; box-shadow: inset 0 0 0 9px rgba(255,255,255,.18); }
.guard-check { width: 20px; height: 11px; border-left: 2px solid var(--sg-gold-deep); border-bottom: 2px solid var(--sg-gold-deep); transform: rotate(-45deg) translate(2px,-2px); }

.action-grid { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 16px; }
.home-action { display: flex; flex-direction: column; align-items: flex-start; justify-content: space-between; min-height: 104px; margin: 0; padding: 16px; border-radius: 20px; color: var(--sg-ink); background: rgba(255,253,248,.9); border: 1px solid rgba(255,255,255,.74); box-shadow: var(--sg-shadow-soft); text-align: left; }
.home-action--sos { color: var(--sg-risk); background: linear-gradient(135deg, #fee4dd, var(--sg-risk-soft)); }
.home-action--gold { background: linear-gradient(135deg, #fff1ce, #f5dc9d); }
.home-action:active { transform: scale(.985); }
.action-mark { display: grid; place-items: center; min-width: 39px; height: 39px; padding: 0 8px; border-radius: 13px; color: var(--sg-risk); background: rgba(255,255,255,.7); font-size: 14px; font-weight: 750; line-height: 39px; }
.action-mark--green { color: var(--sg-safe); }
.action-title { font-size: 19px; font-weight: 700; line-height: 1.3; }

.medicine-card { position: relative; z-index: 1; display: flex; align-items: center; gap: 12px; margin-top: 16px; padding: 13px; border-radius: 19px; background: rgba(255,253,248,.92); border: 1px solid rgba(255,255,255,.76); box-shadow: var(--sg-shadow-soft); }
.medicine-icon { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 15px; color: var(--sg-gold-deep); background: var(--sg-gold-pale); font-size: 17px; font-weight: 750; }
.medicine-copy { flex: 1; min-width: 0; }
.medicine-title, .medicine-time { display: block; }
.medicine-title { margin-bottom: 4px; font-size: 18px; font-weight: 700; }
.medicine-time { color: var(--sg-secondary); font-size: 14px; }
.medicine-action { min-width: 68px; height: 44px; margin: 0; padding: 0 14px; border-radius: 14px; color: var(--sg-ink); background: var(--sg-champagne); font-size: 16px; font-weight: 700; line-height: 44px; }
.voice-button { position: relative; z-index: 1; width: 78%; margin: 18px auto 0; }
.demo-note { position: relative; z-index: 1; display: block; margin-top: 12px; color: var(--sg-secondary); font-size: 12px; text-align: center; }

.bottom-nav { position: fixed; z-index: 5; left: 12px; right: 12px; bottom: calc(env(safe-area-inset-bottom) + 10px); display: grid; grid-template-columns: repeat(4,1fr); padding: 8px 6px 7px; border: 1px solid rgba(255,255,255,.84); border-radius: 22px; background: rgba(255,253,248,.9); box-shadow: 0 10px 28px rgba(35,30,23,.11); backdrop-filter: blur(16px); }
.nav-item { display: flex; flex-direction: column; align-items: center; gap: 2px; color: var(--sg-secondary); font-size: 11px; }
.nav-mark { display: grid; place-items: center; width: 34px; height: 29px; border-radius: 14px; font-size: 13px; font-weight: 700; }
.nav-item--active { color: var(--sg-gold-deep); font-weight: 700; }
.nav-item--active .nav-mark { background: var(--sg-gold-pale); }

.sos-overlay { position: fixed; z-index: 30; inset: 0; min-height: 100vh; padding: calc(env(safe-area-inset-top) + 18px) 20px calc(env(safe-area-inset-bottom) + 22px); background: var(--sg-background); overflow: auto; }
.sos-topbar { font-size: 21px; font-weight: 720; text-align: center; }
.sos-state { display: flex; flex-direction: column; padding-top: 30px; }
.sos-state--center { align-items: center; padding-top: 64px; text-align: center; }
.sos-kicker { margin-bottom: 24px; font-size: 21px; font-weight: 700; }
.holding-ring { display: grid; place-items: center; width: 174px; height: 174px; border-radius: 50%; box-shadow: 0 16px 36px rgba(163,58,50,.12); }
.holding-ring__inner { display: grid; place-items: center; width: 148px; height: 148px; border-radius: 50%; color: var(--sg-risk); background: var(--sg-background); font-size: 54px; font-weight: 760; }
.state-title { display: block; margin-top: 28px; font-size: 27px; font-weight: 760; }
.state-help { display: block; margin-top: 12px; color: var(--sg-secondary); font-size: 16px; }
.state-button { width: 100%; margin-top: 30px; }
.state-button--secondary { margin-top: 12px; }
.sending-ring, .waiting-ring { display: grid; place-items: center; width: 150px; height: 150px; border: 1px solid rgba(214,168,75,.34); border-radius: 50%; box-shadow: inset 0 0 0 12px rgba(251,236,201,.5); }
.sending-dot { width: 30px; height: 30px; border: 5px solid rgba(214,168,75,.28); border-top-color: var(--sg-gold-deep); border-radius: 50%; animation: spin 1s linear infinite; }
.waiting-ring { color: var(--sg-safe); font-size: 40px; font-weight: 720; }
@keyframes spin { to { transform: rotate(360deg); } }
.progress-card { width: 100%; margin-top: 30px; padding: 18px 20px; border-radius: 20px; background: var(--sg-surface); box-shadow: var(--sg-shadow-soft); text-align: left; }
.progress-row { display: flex; align-items: center; gap: 12px; min-height: 40px; color: var(--sg-ink); font-size: 16px; }
.progress-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--sg-gold); }
.progress-dot--done { background: var(--sg-safe); }
.result-card { display: flex; flex-direction: column; align-items: center; padding: 36px 22px; border-radius: 24px; text-align: center; box-shadow: var(--sg-shadow); }
.result-card--safe { background: linear-gradient(135deg, #e3f1e7, var(--sg-safe-soft)); }
.result-card--risk { background: linear-gradient(135deg, #fee7df, var(--sg-risk-soft)); }
.result-icon { display: grid; place-items: center; width: 54px; height: 54px; margin-bottom: 20px; border: 1px solid rgba(34,89,77,.3); border-radius: 50%; color: var(--sg-safe); font-size: 25px; font-weight: 750; }
.result-icon--risk { color: var(--sg-risk); border-color: rgba(163,58,50,.34); }
.result-title { font-size: 27px; font-weight: 760; }
.result-title--risk { color: var(--sg-risk); }
.result-copy { margin-top: 9px; color: var(--sg-secondary); font-size: 16px; }
.family-card, .plain-card { display: flex; align-items: center; gap: 14px; margin-top: 22px; padding: 17px; border-radius: 20px; background: var(--sg-surface); box-shadow: var(--sg-shadow-soft); }
.avatar { display: grid; place-items: center; width: 54px; height: 54px; border-radius: 17px; color: var(--sg-ink); background: var(--sg-gold-pale); font-size: 21px; font-weight: 760; }
.family-name, .family-meta, .plain-title, .plain-copy { display: block; }
.family-name, .plain-title { font-size: 18px; font-weight: 700; }
.family-meta, .plain-copy { margin-top: 5px; color: var(--sg-secondary); font-size: 14px; }
.plain-card { display: block; }
.text-action { min-height: 48px; margin: 16px 0 0; color: var(--sg-secondary); background: transparent; font-size: 16px; line-height: 48px; }
.overlay-demo-note { display: block; margin-top: 18px; color: var(--sg-secondary); font-size: 12px; text-align: center; }

@media (min-width: 600px) {
  .page-shell, .sos-overlay { left: 50%; width: 430px; margin-left: -215px; box-shadow: 0 0 40px rgba(35,30,23,.09); }
}
</style>
