<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import SgIcon from '@/components/SgIcon.vue';
import { countRemaining, getPriorityMedication } from '@/features/medication/domain';
import { createMedicationRepository } from '@/features/medication/repository';
import type { MedicationPlan, MedicationStatus } from '@/features/medication/types';

const repository = createMedicationRepository();
const plans = ref<MedicationPlan[]>([]);
const remaining = computed(() => countRemaining(plans.value));
const current = computed(() => getPriorityMedication(
  plans.value.filter((plan) => plan.status !== 'completed'),
));

const statusText: Record<MedicationStatus, string> = {
  upcoming: '待服用',
  reminding: '现在',
  completed: '已完成',
  missed: '已错过',
};

function refresh() {
  plans.value = repository.listToday();
}

function goBack() {
  uni.navigateBack();
}

function openDetail(plan: MedicationPlan) {
  uni.navigateTo({ url: `/pages/elder/medication/detail?id=${encodeURIComponent(plan.id)}` });
}

function contactFamily() {
  uni.showToast({ title: '演示模式：未拨打电话', icon: 'none' });
}

function goHome() {
  uni.reLaunch({ url: '/pages/elder/home' });
}

function openLife() {
  uni.navigateTo({ url: '/pages/elder/life/index' });
}

onShow(refresh);
</script>

<template>
  <view class="medication-page">
    <view class="ambient ambient--gold" />
    <view class="page-header">
      <button class="back-button" aria-label="返回" @click="goBack"><SgIcon name="chevron-left" :size="25" /></button>
      <text class="page-title">今日用药</text>
      <view class="header-space" />
    </view>

    <view v-if="current" class="summary-card" @click="openDetail(current)">
      <view>
        <text class="summary-kicker">今天还剩 {{ remaining }} 次</text>
        <text class="summary-time">{{ current.time }}</text>
        <text class="summary-name">{{ current.medicineName }} · {{ current.dose }}</text>
      </view>
      <view class="summary-mark"><SgIcon name="pill" :size="30" /></view>
    </view>

    <view v-else class="summary-card summary-card--complete">
      <view>
        <text class="summary-kicker">今日计划</text>
        <text class="summary-time summary-time--complete">全部完成</text>
      </view>
      <view class="summary-mark summary-mark--safe"><SgIcon name="shield-check" :size="30" /></view>
    </view>

    <text class="section-title">今天</text>
    <view class="schedule-card">
      <button
        v-for="plan in plans"
        :key="plan.id"
        class="schedule-row"
        @click="openDetail(plan)"
      >
        <view class="schedule-time"><view class="schedule-point" /><text>{{ plan.time }}</text></view>
        <view class="schedule-copy">
          <text class="schedule-name">{{ plan.medicineName }}</text>
          <text class="schedule-dose">{{ plan.dose }}</text>
        </view>
        <text class="status-label" :class="`status-label--${plan.status}`">
          {{ statusText[plan.status] }}
        </text>
      </button>
    </view>

    <button class="contact-card" @click="contactFamily">
      <view class="contact-mark"><SgIcon name="users" :size="23" /></view>
      <text>联系家人</text>
      <view class="contact-arrow"><SgIcon name="chevron-right" :size="22" /></view>
    </button>

    <text class="demo-note">本地演示计划 · 尚未同步给医生或家人</text>

    <view class="bottom-nav">
      <view class="nav-item nav-item--active" @click="goHome"><view class="nav-mark"><SgIcon name="home" :size="20" /></view><text>首页</text></view>
      <view class="nav-item" @click="openLife"><view class="nav-mark"><SgIcon name="calendar" :size="20" /></view><text>生活</text></view>
      <view class="nav-item"><view class="nav-mark"><SgIcon name="bell" :size="20" /></view><text>消息</text></view>
      <view class="nav-item"><view class="nav-mark"><SgIcon name="user" :size="20" /></view><text>我的</text></view>
    </view>
  </view>
</template>

<style scoped>
.medication-page {
  position: relative;
  min-height: 100vh;
  padding: calc(env(safe-area-inset-top) + 16px) 20px calc(env(safe-area-inset-bottom) + 92px);
  overflow: hidden;
  background:
    radial-gradient(circle at 84% 6%, rgba(245,218,157,.52), transparent 27%),
    radial-gradient(circle at 5% 74%, rgba(232,190,171,.14), transparent 26%),
    linear-gradient(160deg, #f9f3e8 0%, var(--sg-background) 58%, #efe4d1 100%);
}

.ambient { position: absolute; border-radius: 50%; filter: blur(54px); pointer-events: none; opacity: .7; }
.ambient--gold { width: 220px; height: 220px; top: -82px; right: -84px; background: rgba(229,186,93,.32); }
.page-header { position: relative; z-index: 1; display: grid; grid-template-columns: 48px 1fr 48px; align-items: center; min-height: 48px; animation: sg-med-rise var(--sg-motion-emphasized) var(--sg-ease-emphasized) both; }
.back-button { display: grid; place-items: center; width: 48px; height: 48px; margin: 0; padding: 0; border: 1px solid var(--sg-border); border-radius: 16px; color: var(--sg-ink); background: linear-gradient(155deg, rgba(255,253,248,.94), rgba(242,233,218,.9)); box-shadow: 0 7px 18px rgba(69,52,31,.08), inset 0 1px var(--sg-highlight); line-height: 48px; transition: transform var(--sg-motion-fast) var(--sg-ease-standard), box-shadow var(--sg-motion-fast) ease; }
.back-button::after { display: none; border: 0; }
.back-button:active { transform: scale(.94); box-shadow: var(--sg-shadow-pressed); }
.page-title { font-size: 22px; font-weight: 750; text-align: center; }
.header-space { width: 48px; }

.summary-card { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; min-height: 156px; margin-top: 18px; padding: 22px; overflow: hidden; border: 1px solid rgba(130,91,31,.16); border-radius: 28px 28px 28px 10px; background: radial-gradient(circle at 84% 8%, rgba(255,255,255,.52), transparent 28%), linear-gradient(138deg,#faeac2 0%,#edca7e 58%,#dcb25e 100%); box-shadow: var(--sg-shadow), inset 0 1px var(--sg-highlight); transform: translateZ(0); transition: transform var(--sg-motion-fast) var(--sg-ease-standard), box-shadow var(--sg-motion-fast) ease; animation: sg-med-focus-in var(--sg-motion-emphasized) 45ms var(--sg-ease-emphasized) both; }
.summary-card:active { transform: scale(.985); box-shadow: var(--sg-shadow-pressed); }
.summary-card--complete { border-color: rgba(34,89,77,.15); background: radial-gradient(circle at 84% 8%, rgba(255,255,255,.52), transparent 28%), linear-gradient(138deg,#e9f3e9,#c8e3d4); }
.summary-kicker, .summary-time, .summary-name { display: block; }
.summary-kicker { color: var(--sg-gold-deep); font-size: 18px; font-weight: 700; }
.summary-time { margin-top: 16px; font-size: 38px; font-weight: 780; letter-spacing: -.5px; }
.summary-time--complete { font-size: 29px; }
.summary-name { margin-top: 5px; font-size: 19px; font-weight: 680; }
.summary-mark { position: relative; z-index: 1; display: grid; place-items: center; width: 58px; height: 58px; border-radius: 18px; color: var(--sg-gold-deep); background: rgba(255,249,234,.62); box-shadow: inset 0 1px rgba(255,255,255,.62), 0 8px 20px rgba(111,78,31,.12); }
.summary-mark--safe { color: var(--sg-safe); }

.section-title { position: relative; z-index: 1; display: block; margin: 28px 0 12px; font-size: 20px; font-weight: 750; animation: sg-med-rise var(--sg-motion-emphasized) 90ms var(--sg-ease-emphasized) both; }
.schedule-card { position: relative; z-index: 1; padding: 5px 16px 5px 12px; overflow: hidden; border: 1px solid var(--sg-border); border-radius: 22px 22px 22px 8px; background: linear-gradient(155deg, rgba(255,253,248,.97), rgba(244,234,216,.95)); box-shadow: 0 12px 28px rgba(61,45,27,.1), inset 0 1px var(--sg-highlight); animation: sg-ledger-in var(--sg-motion-emphasized) 120ms var(--sg-ease-emphasized) both; }
.schedule-card::before { content: ''; position: absolute; top: 29px; bottom: 29px; left: 36px; width: 1px; background: linear-gradient(rgba(214,168,75,.2), rgba(214,168,75,.72), rgba(214,168,75,.2)); }
.schedule-row { position: relative; display: grid; grid-template-columns: 64px 1fr auto; align-items: center; width: 100%; min-height: 72px; margin: 0; padding: 10px 0; border: 0; border-bottom: 1px solid rgba(110,102,90,.13); border-radius: 0; color: var(--sg-ink); background: transparent; text-align: left; line-height: 1.25; transition: transform var(--sg-motion-fast) var(--sg-ease-standard), opacity var(--sg-motion-fast) ease; }
.schedule-row::after { display: none; border: 0; }
.schedule-row:active { transform: scale(.985); opacity: .76; }
.schedule-row:last-child { border-bottom: 0; }
.schedule-time { position: relative; z-index: 1; display: flex; align-items: center; gap: 9px; color: var(--sg-gold-deep); font-size: 17px; font-weight: 760; }
.schedule-point { flex: 0 0 auto; width: 11px; height: 11px; border: 3px solid rgba(255,253,248,.95); border-radius: 50%; background: var(--sg-gold); box-shadow: 0 0 0 1px rgba(156,105,25,.22); }
.schedule-copy { flex: 1; min-width: 0; padding-left: 13px; }
.schedule-name, .schedule-dose { display: block; }
.schedule-name { font-size: 18px; font-weight: 700; }
.schedule-dose { margin-top: 3px; color: var(--sg-secondary); font-size: 15px; }
.status-label { padding: 7px 9px; border-radius: 11px; font-size: 14px; font-weight: 700; }
.status-label--completed { color: var(--sg-safe); background: var(--sg-safe-soft); }
.status-label--reminding { color: var(--sg-gold-deep); background: var(--sg-gold-pale); }
.status-label--upcoming { color: var(--sg-secondary); background: #f1eee7; }
.status-label--missed { color: var(--sg-risk); background: var(--sg-risk-soft); }

.contact-card { position: relative; z-index: 1; display: flex; align-items: center; width: 100%; min-height: 66px; margin: 18px 0 0; padding: 10px 14px; border: 1px solid var(--sg-border); border-radius: 20px; color: var(--sg-ink); background: linear-gradient(155deg, rgba(255,253,248,.97), rgba(244,234,216,.95)); box-shadow: var(--sg-shadow-soft), inset 0 1px var(--sg-highlight); font-size: 18px; font-weight: 700; text-align: left; transition: transform var(--sg-motion-fast) var(--sg-ease-standard), box-shadow var(--sg-motion-fast) ease; animation: sg-med-rise var(--sg-motion-emphasized) 160ms var(--sg-ease-emphasized) both; }
.contact-card::after { display: none; border: 0; }
.contact-card:active { transform: scale(.985); box-shadow: var(--sg-shadow-pressed); }
.contact-mark { display: grid; place-items: center; width: 42px; height: 42px; margin-right: 12px; border-radius: 14px; color: var(--sg-safe); background: linear-gradient(145deg,#e8f2e9,#cfe4d6); box-shadow: inset 0 1px rgba(255,255,255,.62); }
.contact-arrow { display: grid; place-items: center; margin-left: auto; }
.demo-note { position: relative; z-index: 1; display: block; margin-top: 14px; color: var(--sg-secondary); font-size: 12px; text-align: center; }

.bottom-nav { position: fixed; z-index: 5; left: 12px; right: 12px; bottom: calc(env(safe-area-inset-bottom) + 10px); display: grid; grid-template-columns: repeat(4,1fr); padding: 8px 6px 7px; border: 1px solid var(--sg-border); border-radius: 22px; background: linear-gradient(155deg, rgba(255,253,248,.96), rgba(242,233,218,.94)); box-shadow: 0 14px 32px rgba(58,43,27,.15), inset 0 1px var(--sg-highlight); backdrop-filter: blur(14px); animation: sg-med-nav 420ms 170ms var(--sg-ease-emphasized) both; }
.nav-item { display: flex; flex-direction: column; align-items: center; gap: 2px; color: var(--sg-secondary); font-size: 11px; }
.nav-mark { display: grid; place-items: center; width: 42px; height: 31px; border-radius: 15px; transition: background var(--sg-motion-standard) ease, transform var(--sg-motion-standard) var(--sg-ease-emphasized); }
.nav-item--active { color: var(--sg-gold-deep); font-weight: 700; }
.nav-item--active .nav-mark { background: linear-gradient(145deg,#f9e7b9,#edcb7e); box-shadow: inset 0 1px rgba(255,255,255,.55); transform: translateY(-1px); }

@keyframes sg-med-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes sg-med-focus-in { from { opacity: 0; transform: translateY(8px) scale(.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes sg-ledger-in { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
@keyframes sg-med-nav { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

@media (min-width: 600px) {
  .medication-page { left: 50%; width: 430px; margin-left: -215px; box-shadow: 0 0 40px rgba(35,30,23,.09); }
}
</style>
