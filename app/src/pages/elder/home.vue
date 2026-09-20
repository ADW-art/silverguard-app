<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { onHide, onShow, onUnload } from '@dcloudio/uni-app';
import SgButton from '@/components/SgButton.vue';
import SgIcon from '@/components/SgIcon.vue';
import { triggerHaptic } from '@/features/feedback/haptics';
import { getPriorityMedication } from '@/features/medication/domain';
import { createMedicationRepository } from '@/features/medication/repository';
import type { MedicationPlan } from '@/features/medication/types';
import { createMockSosGateway } from '@/features/sos/gateway';
import { useSosFlow } from '@/features/sos/useSosFlow';

const configuredOutcome = import.meta.env.VITE_SOS_DEMO_OUTCOME;
const demoOutcome = configuredOutcome === 'timeout' || configuredOutcome === 'failure'
  ? configuredOutcome
  : 'claimed';
const gateway = createMockSosGateway({ outcome: demoOutcome });
const medicationRepository = createMedicationRepository();
const priorityMedication = ref<MedicationPlan>();
const medicineTitle = computed(() => priorityMedication.value
  ? `${priorityMedication.value.medicineName} · ${priorityMedication.value.dose}`
  : '今日用药已完成');
const medicineTime = computed(() => priorityMedication.value
  ? `今天 ${priorityMedication.value.time}`
  : '已全部确认');
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

function beginPointerHold(event: PointerEvent) {
  const target = event.currentTarget as HTMLElement | null;
  target?.setPointerCapture?.(event.pointerId);
  startHold();
}

function endPointerHold(event: PointerEvent) {
  const target = event.currentTarget as HTMLElement | null;
  if (target?.hasPointerCapture?.(event.pointerId)) {
    target.releasePointerCapture(event.pointerId);
  }
  cancelHold();
}

function beginKeyboardHold() {
  startHold();
}

function endKeyboardHold() {
  cancelHold();
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
  triggerHaptic('success');
  uni.showToast({ title: '已记录今日平安', icon: 'success' });
}

function openMedication() {
  uni.navigateTo({ url: '/pages/elder/medication/index' });
}

function announceVoicePlaceholder() {
  uni.showToast({ title: '语音功能将在后续切片接入', icon: 'none' });
}

onHide(cancelHold);
onShow(() => {
  priorityMedication.value = getPriorityMedication(
    medicationRepository.listToday().filter((plan) => plan.status !== 'completed'),
  );
});
watch(() => state.value.phase, (phase, previousPhase) => {
  if (phase === 'sending' && previousPhase === 'holding') triggerHaptic('warning');
  if (phase === 'claimed') triggerHaptic('success');
});
onUnload(() => {
  if (touchReleaseTimer) clearTimeout(touchReleaseTimer);
  dispose();
});
</script>

<template>
  <view class="page-shell">
    <view class="ambient ambient--gold" />
    <view class="ambient ambient--blush" />
    <view class="ambient ambient--cream" />

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
      <view class="guard-ring">
        <view class="guard-ring__track" />
        <view class="guard-icon"><SgIcon name="shield-check" :size="28" /></view>
      </view>
    </view>

    <view class="action-grid">
      <!-- #ifdef H5 -->
      <div
        class="home-action home-action--sos"
        role="button"
        tabindex="0"
        aria-label="长按三秒发送求助"
        @pointerdown.stop.prevent="beginPointerHold"
        @pointerup.stop.prevent="endPointerHold"
        @pointercancel.stop.prevent="endPointerHold"
        @keydown.space.prevent="beginKeyboardHold"
        @keyup.space.prevent="endKeyboardHold"
        @contextmenu.prevent
      >
        <view class="action-mark"><SgIcon name="sos" :size="27" /></view>
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
        <view class="action-mark"><SgIcon name="sos" :size="27" /></view>
        <text class="action-title">长按求助</text>
      </button>
      <!-- #endif -->
      <button class="home-action home-action--gold" @click="reportSafe">
        <view class="action-mark"><SgIcon name="heart" :size="27" /></view>
        <text class="action-title">一键报平安</text>
      </button>
      <button class="home-action" @click="showContact">
        <view class="action-mark action-mark--green"><SgIcon name="users" :size="27" /></view>
        <text class="action-title">联系家人</text>
      </button>
      <button class="home-action">
        <view class="action-mark action-mark--green"><SgIcon name="calendar" :size="27" /></view>
        <text class="action-title">生活工具</text>
      </button>
    </view>

    <view class="medicine-card" @click="openMedication">
      <view class="medicine-icon"><SgIcon name="pill" :size="25" /></view>
      <view class="medicine-copy">
        <text class="medicine-title">{{ medicineTitle }}</text>
        <text class="medicine-time">{{ medicineTime }}</text>
      </view>
      <button class="medicine-action" @click.stop="openMedication">查看</button>
    </view>

    <SgButton class="voice-button" @press="announceVoicePlaceholder">
      <view class="voice-button__content"><SgIcon name="mic" :size="21" /><text>按住说话</text></view>
    </SgButton>

    <text class="demo-note">演示模式 · 当前不会发送真实通知</text>

    <view class="bottom-nav">
      <view class="nav-item nav-item--active"><view class="nav-mark"><SgIcon name="home" :size="20" /></view><text>首页</text></view>
      <view class="nav-item"><view class="nav-mark"><SgIcon name="calendar" :size="20" /></view><text>生活</text></view>
      <view class="nav-item"><view class="nav-mark"><SgIcon name="bell" :size="20" /></view><text>消息</text></view>
      <view class="nav-item"><view class="nav-mark"><SgIcon name="user" :size="20" /></view><text>我的</text></view>
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
        <view class="waiting-ring"><SgIcon name="shield-check" :size="42" /></view>
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
          <view class="result-icon"><SgIcon name="shield-check" :size="28" /></view>
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
          <view class="result-icon result-icon--risk"><SgIcon name="sos" :size="28" /></view>
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
          <view class="result-icon result-icon--risk"><SgIcon name="sos" :size="28" /></view>
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
  background:
    radial-gradient(circle at 84% 7%, rgba(245, 218, 157, .54), transparent 27%),
    radial-gradient(circle at 8% 62%, rgba(232, 190, 171, .18), transparent 27%),
    linear-gradient(160deg, #f9f3e8 0%, var(--sg-background) 56%, #efe4d1 100%);
}

.ambient { position: absolute; border-radius: 50%; filter: blur(52px); pointer-events: none; opacity: .72; }
.ambient--gold { width: 210px; height: 210px; top: -76px; right: -82px; background: rgba(229, 186, 93, .34); }
.ambient--blush { width: 170px; height: 170px; left: -110px; top: 430px; background: rgba(224, 164, 139, .2); }
.ambient--cream { width: 180px; height: 180px; right: -104px; bottom: 96px; background: rgba(255, 247, 224, .72); }

.top-row { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; animation: sg-rise var(--sg-motion-emphasized) var(--sg-ease-emphasized) both; }
.eyebrow { display: block; margin-bottom: 3px; color: var(--sg-gold-deep); font-size: 13px; font-weight: 650; letter-spacing: 1px; }
.greeting { display: block; font-size: 26px; font-weight: 750; }
.status-pill { display: flex; align-items: center; gap: 7px; padding: 9px 13px; border-radius: 999px; color: var(--sg-safe); background: linear-gradient(160deg, rgba(255,253,248,.92), rgba(243,236,222,.9)); border: 1px solid var(--sg-border); box-shadow: 0 7px 18px rgba(69,52,31,.08), inset 0 1px var(--sg-highlight); font-size: 14px; font-weight: 680; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--sg-safe); }

.hero-card { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; min-height: 132px; padding: 23px; overflow: hidden; border-radius: var(--sg-radius-hero); background: radial-gradient(circle at 82% 12%, rgba(255,255,255,.5), transparent 28%), linear-gradient(138deg, #faeac2 0%, #edca7e 58%, #dcb25e 100%); border: 1px solid rgba(130,91,31,.16); box-shadow: 0 20px 42px rgba(111,78,31,.16), 0 4px 12px rgba(111,78,31,.1), inset 0 1px rgba(255,255,255,.58); animation: sg-rise var(--sg-motion-emphasized) 40ms var(--sg-ease-emphasized) both; }
.hero-card::after { content: ''; position: absolute; width: 150px; height: 150px; right: -54px; bottom: -88px; border: 1px solid rgba(255,255,255,.3); border-radius: 50%; box-shadow: inset 0 0 0 16px rgba(255,255,255,.07); pointer-events: none; }
.hero-title { display: block; margin-bottom: 9px; font-size: 27px; font-weight: 760; }
.hero-copy { display: block; max-width: 200px; color: #5d4b2f; font-size: 15px; line-height: 1.5; }
.guard-ring { position: relative; z-index: 1; display: grid; place-items: center; width: 70px; height: 70px; border-radius: 50%; background: rgba(255,249,234,.28); box-shadow: inset 0 0 0 1px rgba(116,79,24,.23), inset 0 0 0 9px rgba(255,255,255,.12), 0 8px 20px rgba(111,78,31,.12); }
.guard-ring__track { position: absolute; inset: 5px; border: 2px solid rgba(128,89,31,.18); border-top-color: rgba(128,89,31,.65); border-radius: 50%; animation: sg-ring-reveal 720ms 180ms var(--sg-ease-emphasized) both; }
.guard-icon { opacity: 0; transform: scale(.78); animation: sg-icon-in 360ms 430ms var(--sg-ease-emphasized) forwards; }

.action-grid { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 17px; animation: sg-rise var(--sg-motion-emphasized) 90ms var(--sg-ease-emphasized) both; }
.home-action { display: flex; flex-direction: column; align-items: flex-start; justify-content: space-between; min-height: 108px; margin: 0; padding: 16px; overflow: hidden; border-radius: 20px; color: var(--sg-ink); background: linear-gradient(155deg, var(--sg-surface-raised), #f5ecdc); border: 1px solid var(--sg-border); box-shadow: var(--sg-shadow-soft), inset 0 1px var(--sg-highlight); text-align: left; transform: translateZ(0); transition: transform var(--sg-motion-fast) var(--sg-ease-standard), box-shadow var(--sg-motion-fast) var(--sg-ease-standard), filter var(--sg-motion-fast) ease; }
.home-action::after { display: none; border: 0; }
.home-action--sos { color: var(--sg-risk); background: radial-gradient(circle at 85% 10%, rgba(255,255,255,.55), transparent 28%), linear-gradient(145deg, #f9ddd5, #efbbb0); border-color: rgba(163,58,50,.15); }
.home-action--gold { background: radial-gradient(circle at 85% 10%, rgba(255,255,255,.52), transparent 28%), linear-gradient(145deg, #f9e8bd, #ecc975); border-color: rgba(128,89,31,.17); }
.home-action:active { transform: scale(var(--sg-press-scale)); box-shadow: var(--sg-shadow-pressed); filter: brightness(.97); }
.action-mark { display: grid; place-items: center; width: 43px; height: 43px; padding: 0; border-radius: 14px; background: rgba(255,250,240,.66); box-shadow: inset 0 1px rgba(255,255,255,.6), 0 4px 12px rgba(75,53,27,.07); }
.action-mark--green { color: var(--sg-safe); }
.action-title { font-size: 19px; font-weight: 700; line-height: 1.3; }

.medicine-card { position: relative; z-index: 1; display: flex; align-items: center; gap: 12px; margin-top: 17px; padding: 13px; border-radius: 19px; background: linear-gradient(155deg, rgba(255,253,248,.97), rgba(245,236,220,.95)); border: 1px solid var(--sg-border); box-shadow: var(--sg-shadow-soft), inset 0 1px var(--sg-highlight); transition: transform var(--sg-motion-fast) var(--sg-ease-standard), box-shadow var(--sg-motion-fast) ease; animation: sg-rise var(--sg-motion-emphasized) 140ms var(--sg-ease-emphasized) both; }
.medicine-card:active { transform: scale(.985); box-shadow: var(--sg-shadow-pressed); }
.medicine-icon { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 15px; background: linear-gradient(145deg, #fbedc9, #efd18e); box-shadow: inset 0 1px rgba(255,255,255,.65); }
.medicine-copy { flex: 1; min-width: 0; }
.medicine-title, .medicine-time { display: block; }
.medicine-title { margin-bottom: 4px; font-size: 18px; font-weight: 700; }
.medicine-time { color: var(--sg-secondary); font-size: 14px; }
.medicine-action { min-width: 68px; height: 44px; margin: 0; padding: 0 14px; border: 0; border-radius: 14px; color: var(--sg-ink); background: linear-gradient(145deg, #f3d99f, #e6bd67); box-shadow: 0 6px 14px rgba(111,78,31,.12), inset 0 1px rgba(255,255,255,.45); font-size: 16px; font-weight: 700; line-height: 44px; transition: transform var(--sg-motion-fast) ease, box-shadow var(--sg-motion-fast) ease; }
.medicine-action::after { display: none; }
.medicine-action:active { transform: scale(.96); box-shadow: var(--sg-shadow-pressed); }
.voice-button { position: relative; z-index: 1; width: 78%; margin: 18px auto 0; animation: sg-rise var(--sg-motion-emphasized) 180ms var(--sg-ease-emphasized) both; }
.voice-button__content { display: flex; align-items: center; justify-content: center; gap: 9px; min-height: 56px; }
.demo-note { position: relative; z-index: 1; display: block; margin-top: 12px; color: var(--sg-secondary); font-size: 12px; text-align: center; }

.bottom-nav { position: fixed; z-index: 5; left: 12px; right: 12px; bottom: calc(env(safe-area-inset-bottom) + 10px); display: grid; grid-template-columns: repeat(4,1fr); padding: 8px 6px 7px; border: 1px solid var(--sg-border); border-radius: 22px; background: linear-gradient(155deg, rgba(255,253,248,.96), rgba(242,233,218,.94)); box-shadow: 0 14px 32px rgba(58,43,27,.15), inset 0 1px var(--sg-highlight); backdrop-filter: blur(14px); animation: sg-nav-in 420ms 160ms var(--sg-ease-emphasized) both; }
.nav-item { display: flex; flex-direction: column; align-items: center; gap: 2px; color: var(--sg-secondary); font-size: 11px; }
.nav-mark { display: grid; place-items: center; width: 42px; height: 31px; border-radius: 15px; transition: background var(--sg-motion-standard) ease, transform var(--sg-motion-standard) var(--sg-ease-emphasized); }
.nav-item--active { color: var(--sg-gold-deep); font-weight: 700; }
.nav-item--active .nav-mark { background: linear-gradient(145deg, #f9e7b9, #edcb7e); box-shadow: inset 0 1px rgba(255,255,255,.55); transform: translateY(-1px); }

.sos-overlay { position: fixed; z-index: 30; inset: 0; min-height: 100vh; padding: calc(env(safe-area-inset-top) + 18px) 20px calc(env(safe-area-inset-bottom) + 22px); overflow: auto; background: radial-gradient(circle at 80% 8%, rgba(242,211,143,.48), transparent 26%), radial-gradient(circle at 6% 78%, rgba(221,159,137,.16), transparent 24%), linear-gradient(160deg, #faf4e9 0%, #f3ebde 58%, #eadfcb 100%); animation: sg-overlay-in var(--sg-motion-standard) var(--sg-ease-emphasized) both; }
.sos-overlay::after { content: ''; position: fixed; z-index: -1; width: 220px; height: 220px; right: -126px; bottom: 12%; border-radius: 50%; background: rgba(255,246,222,.72); filter: blur(54px); pointer-events: none; }
.sos-topbar { position: relative; z-index: 1; font-size: 21px; font-weight: 720; text-align: center; }
.sos-state { position: relative; z-index: 1; display: flex; flex-direction: column; padding-top: 30px; animation: sg-state-in var(--sg-motion-emphasized) var(--sg-ease-emphasized) both; }
.sos-state--center { align-items: center; padding-top: 64px; text-align: center; }
.sos-kicker { margin-bottom: 24px; font-size: 21px; font-weight: 700; }
.holding-ring { display: grid; place-items: center; width: 174px; height: 174px; border-radius: 50%; box-shadow: 0 20px 44px rgba(163,58,50,.13), inset 0 1px rgba(255,250,240,.7); }
.holding-ring__inner { display: grid; place-items: center; width: 148px; height: 148px; border-radius: 50%; color: var(--sg-risk); background: radial-gradient(circle at 36% 28%, #fff9ee, #f1e6d5); box-shadow: inset 0 0 0 1px rgba(139,92,54,.12), 0 8px 20px rgba(74,48,29,.1); font-size: 54px; font-weight: 760; }
.state-title { display: block; margin-top: 28px; font-size: 27px; font-weight: 760; }
.state-help { display: block; margin-top: 12px; color: var(--sg-secondary); font-size: 16px; }
.state-button { width: 100%; margin-top: 30px; }
.state-button--secondary { margin-top: 12px; }
.sending-ring, .waiting-ring { display: grid; place-items: center; width: 150px; height: 150px; border: 1px solid rgba(130,91,31,.2); border-radius: 50%; background: radial-gradient(circle at 38% 30%, #fff8e9, #ead9b8); box-shadow: inset 0 0 0 12px rgba(251,236,201,.55), 0 22px 44px rgba(99,70,32,.15), inset 0 1px rgba(255,255,255,.55); animation: sg-orb-in 520ms var(--sg-ease-emphasized) both; }
.sending-dot { width: 30px; height: 30px; border: 5px solid rgba(214,168,75,.28); border-top-color: var(--sg-gold-deep); border-radius: 50%; animation: spin 1s linear infinite; }
.waiting-ring { color: var(--sg-safe); font-size: 40px; font-weight: 720; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes sg-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes sg-nav-in { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
@keyframes sg-ring-reveal { from { opacity: 0; transform: rotate(-70deg) scale(.86); } to { opacity: 1; transform: rotate(0) scale(1); } }
@keyframes sg-icon-in { from { opacity: 0; transform: scale(.78); } to { opacity: 1; transform: scale(1); } }
@keyframes sg-overlay-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes sg-state-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes sg-orb-in { from { opacity: 0; transform: scale(.9); } to { opacity: 1; transform: scale(1); } }
.progress-card { width: 100%; margin-top: 30px; padding: 18px 20px; border: 1px solid var(--sg-border); border-radius: 20px; background: linear-gradient(155deg, rgba(255,253,248,.97), rgba(244,234,216,.95)); box-shadow: var(--sg-shadow-soft), inset 0 1px var(--sg-highlight); text-align: left; }
.progress-row { display: flex; align-items: center; gap: 12px; min-height: 40px; color: var(--sg-ink); font-size: 16px; }
.progress-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--sg-gold); }
.progress-dot--done { background: var(--sg-safe); }
.result-card { display: flex; flex-direction: column; align-items: center; padding: 36px 22px; border: 1px solid var(--sg-border); border-radius: 24px; text-align: center; box-shadow: var(--sg-shadow), inset 0 1px var(--sg-highlight); }
.result-card--safe { border-color: rgba(34,89,77,.15); background: radial-gradient(circle at 82% 12%, rgba(255,255,255,.55), transparent 30%), linear-gradient(138deg, #e9f3e9, #c8e3d4); }
.result-card--risk { border-color: rgba(163,58,50,.14); background: radial-gradient(circle at 82% 12%, rgba(255,255,255,.5), transparent 30%), linear-gradient(138deg, #fee8df, #f2c6bc); }
.result-icon { display: grid; place-items: center; width: 54px; height: 54px; margin-bottom: 20px; border: 1px solid rgba(34,89,77,.3); border-radius: 50%; color: var(--sg-safe); font-size: 25px; font-weight: 750; }
.result-icon--risk { color: var(--sg-risk); border-color: rgba(163,58,50,.34); }
.result-title { font-size: 27px; font-weight: 760; }
.result-title--risk { color: var(--sg-risk); }
.result-copy { margin-top: 9px; color: var(--sg-secondary); font-size: 16px; }
.family-card, .plain-card { display: flex; align-items: center; gap: 14px; margin-top: 22px; padding: 17px; border: 1px solid var(--sg-border); border-radius: 20px; background: linear-gradient(155deg, rgba(255,253,248,.97), rgba(244,234,216,.95)); box-shadow: var(--sg-shadow-soft), inset 0 1px var(--sg-highlight); }
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
