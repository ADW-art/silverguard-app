<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
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

onShow(refresh);
</script>

<template>
  <view class="medication-page">
    <view class="ambient ambient--gold" />
    <view class="page-header">
      <button class="back-button" aria-label="返回" @click="goBack">‹</button>
      <text class="page-title">今日用药</text>
      <view class="header-space" />
    </view>

    <view v-if="current" class="summary-card" @click="openDetail(current)">
      <view>
        <text class="summary-kicker">今天还剩 {{ remaining }} 次</text>
        <text class="summary-time">{{ current.time }}</text>
        <text class="summary-name">{{ current.medicineName }} · {{ current.dose }}</text>
      </view>
      <view class="summary-mark">药</view>
    </view>

    <view v-else class="summary-card summary-card--complete">
      <view>
        <text class="summary-kicker">今日计划</text>
        <text class="summary-time summary-time--complete">全部完成</text>
      </view>
      <view class="summary-mark summary-mark--safe">✓</view>
    </view>

    <text class="section-title">今天</text>
    <view class="schedule-card">
      <button
        v-for="plan in plans"
        :key="plan.id"
        class="schedule-row"
        @click="openDetail(plan)"
      >
        <view class="schedule-time"><text>{{ plan.time }}</text></view>
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
      <view class="contact-mark">家</view>
      <text>联系家人</text>
      <text class="contact-arrow">›</text>
    </button>

    <text class="demo-note">本地演示计划 · 尚未同步给医生或家人</text>

    <view class="bottom-nav">
      <view class="nav-item nav-item--active"><text class="nav-mark">首</text><text>首页</text></view>
      <view class="nav-item"><text class="nav-mark">生</text><text>生活</text></view>
      <view class="nav-item"><text class="nav-mark">消</text><text>消息</text></view>
      <view class="nav-item"><text class="nav-mark">我</text><text>我的</text></view>
    </view>
  </view>
</template>

<style scoped>
.medication-page {
  position: relative;
  min-height: 100vh;
  padding: calc(env(safe-area-inset-top) + 16px) 20px calc(env(safe-area-inset-bottom) + 92px);
  overflow: hidden;
  background: var(--sg-background);
}

.ambient { position: absolute; border-radius: 50%; filter: blur(52px); pointer-events: none; }
.ambient--gold { width: 220px; height: 220px; top: -82px; right: -84px; background: rgba(243,215,154,.54); }
.page-header { position: relative; z-index: 1; display: grid; grid-template-columns: 48px 1fr 48px; align-items: center; min-height: 48px; }
.back-button { width: 48px; height: 48px; margin: 0; padding: 0; color: var(--sg-ink); background: transparent; font-size: 36px; line-height: 44px; }
.page-title { font-size: 22px; font-weight: 750; text-align: center; }
.header-space { width: 48px; }

.summary-card { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; min-height: 156px; margin-top: 18px; padding: 22px; border: 1px solid rgba(255,255,255,.52); border-radius: 24px; background: linear-gradient(135deg,#fff0c8,#f3d58e); box-shadow: var(--sg-shadow); }
.summary-card--complete { background: linear-gradient(135deg,#e3f1e7,var(--sg-safe-soft)); }
.summary-kicker, .summary-time, .summary-name { display: block; }
.summary-kicker { color: var(--sg-gold-deep); font-size: 18px; font-weight: 700; }
.summary-time { margin-top: 16px; font-size: 38px; font-weight: 780; letter-spacing: -.5px; }
.summary-time--complete { font-size: 29px; }
.summary-name { margin-top: 5px; font-size: 19px; font-weight: 680; }
.summary-mark { display: grid; place-items: center; width: 58px; height: 58px; border-radius: 18px; color: var(--sg-gold-deep); background: rgba(255,253,248,.72); font-size: 20px; font-weight: 750; }
.summary-mark--safe { color: var(--sg-safe); }

.section-title { position: relative; z-index: 1; display: block; margin: 28px 0 12px; font-size: 20px; font-weight: 750; }
.schedule-card { position: relative; z-index: 1; padding: 2px 16px; border: 1px solid rgba(255,255,255,.78); border-radius: 22px; background: rgba(255,253,248,.92); box-shadow: var(--sg-shadow-soft); }
.schedule-row { display: flex; align-items: center; width: 100%; min-height: 76px; margin: 0; padding: 12px 0; border-bottom: 1px solid rgba(110,102,90,.13); border-radius: 0; color: var(--sg-ink); background: transparent; text-align: left; }
.schedule-row:last-child { border-bottom: 0; }
.schedule-time { display: grid; place-items: center; width: 60px; height: 46px; border-radius: 14px; background: var(--sg-gold-pale); font-size: 17px; font-weight: 750; }
.schedule-copy { flex: 1; min-width: 0; padding-left: 13px; }
.schedule-name, .schedule-dose { display: block; }
.schedule-name { font-size: 18px; font-weight: 700; }
.schedule-dose { margin-top: 3px; color: var(--sg-secondary); font-size: 15px; }
.status-label { padding: 7px 9px; border-radius: 11px; font-size: 14px; font-weight: 700; }
.status-label--completed { color: var(--sg-safe); background: var(--sg-safe-soft); }
.status-label--reminding { color: var(--sg-gold-deep); background: var(--sg-gold-pale); }
.status-label--upcoming { color: var(--sg-secondary); background: #f1eee7; }
.status-label--missed { color: var(--sg-risk); background: var(--sg-risk-soft); }

.contact-card { position: relative; z-index: 1; display: flex; align-items: center; width: 100%; min-height: 66px; margin: 18px 0 0; padding: 10px 14px; border: 1px solid rgba(255,255,255,.76); border-radius: 20px; color: var(--sg-ink); background: rgba(255,253,248,.92); box-shadow: var(--sg-shadow-soft); font-size: 18px; font-weight: 700; text-align: left; }
.contact-mark { display: grid; place-items: center; width: 42px; height: 42px; margin-right: 12px; border-radius: 14px; color: var(--sg-safe); background: var(--sg-safe-soft); }
.contact-arrow { margin-left: auto; color: var(--sg-secondary); font-size: 28px; }
.demo-note { position: relative; z-index: 1; display: block; margin-top: 14px; color: var(--sg-secondary); font-size: 12px; text-align: center; }

.bottom-nav { position: fixed; z-index: 5; left: 12px; right: 12px; bottom: calc(env(safe-area-inset-bottom) + 10px); display: grid; grid-template-columns: repeat(4,1fr); padding: 8px 6px 7px; border: 1px solid rgba(255,255,255,.84); border-radius: 22px; background: rgba(255,253,248,.9); box-shadow: 0 10px 28px rgba(35,30,23,.11); backdrop-filter: blur(16px); }
.nav-item { display: flex; flex-direction: column; align-items: center; gap: 2px; color: var(--sg-secondary); font-size: 11px; }
.nav-mark { display: grid; place-items: center; width: 34px; height: 29px; border-radius: 14px; font-size: 13px; font-weight: 700; }
.nav-item--active { color: var(--sg-gold-deep); font-weight: 700; }
.nav-item--active .nav-mark { background: var(--sg-gold-pale); }

@media (min-width: 600px) {
  .medication-page { left: 50%; width: 430px; margin-left: -215px; box-shadow: 0 0 40px rgba(35,30,23,.09); }
}
</style>
