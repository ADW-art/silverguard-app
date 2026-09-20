<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import SgButton from '@/components/SgButton.vue';
import { createMedicationRepository } from '@/features/medication/repository';
import type { MedicationPlan, MedicationStatus } from '@/features/medication/types';

const repository = createMedicationRepository();
const planId = ref('');
const plans = ref<MedicationPlan[]>([]);
const plan = computed(() => plans.value.find((item) => item.id === planId.value));
const statusText: Record<MedicationStatus, string> = {
  upcoming: '即将开始',
  reminding: '正在提醒',
  completed: '已完成',
  missed: '已错过',
};

function refresh() {
  plans.value = repository.listToday();
}

function currentClock(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function confirmTaken() {
  if (!plan.value) return;
  const update = repository.confirm(plan.value.id, currentClock());
  plans.value = update.plans;
  uni.showToast({
    title: update.result === 'already-completed' ? '这次用药已经确认' : '已记录服药',
    icon: update.result === 'updated' ? 'success' : 'none',
  });
}

function snooze() {
  if (!plan.value) return;
  const update = repository.snooze(plan.value.id);
  plans.value = update.plans;
  uni.showToast({
    title: update.result === 'updated' ? '将在 10 分钟后提醒' : '当前不需要稍后提醒',
    icon: 'none',
  });
}

function contactFamily() {
  uni.showToast({ title: '演示模式：未拨打电话', icon: 'none' });
}

function goBack() {
  uni.navigateBack();
}

onLoad((query) => {
  planId.value = typeof query?.id === 'string' ? decodeURIComponent(query.id) : '';
  refresh();
});
onShow(refresh);
</script>

<template>
  <view class="detail-page">
    <view class="ambient ambient--gold" />
    <view class="page-header">
      <button class="back-button" aria-label="返回" @click="goBack">‹</button>
      <text class="page-title">用药提醒</text>
      <view class="header-space" />
    </view>

    <template v-if="plan">
      <view class="medicine-hero" :class="{ 'medicine-hero--complete': plan.status === 'completed' }">
        <view class="medicine-mark">药</view>
        <text class="medicine-time">{{ plan.time }}</text>
        <text class="medicine-name">{{ plan.medicineName }}</text>
        <text class="medicine-dose">{{ plan.dose }}</text>
        <text class="medicine-status" :class="`medicine-status--${plan.status}`">
          {{ statusText[plan.status] }}
        </text>
      </view>

      <SgButton class="primary-action" @press="confirmTaken">
        {{ plan.status === 'completed' ? '已确认服药' : '确认已服药' }}
      </SgButton>
      <SgButton
        v-if="plan.status === 'reminding'"
        variant="secondary"
        class="secondary-action"
        @press="snooze"
      >
        稍后提醒
      </SgButton>

      <button class="contact-card" @click="contactFamily">
        <view class="contact-mark">家</view>
        <text>联系家人</text>
        <text class="contact-arrow">›</text>
      </button>

      <text v-if="plan.status === 'missed'" class="missed-note">
        此处只记录状态，如有疑问请联系家人或专业人员。
      </text>
    </template>

    <view v-else class="missing-card">
      <text class="missing-title">未找到这条用药计划</text>
      <SgButton variant="secondary" class="missing-action" @press="goBack">返回今日计划</SgButton>
    </view>

    <text class="demo-note">本地演示计划 · 不提供医疗判断</text>
  </view>
</template>

<style scoped>
.detail-page { position: relative; min-height: 100vh; padding: calc(env(safe-area-inset-top) + 16px) 20px calc(env(safe-area-inset-bottom) + 28px); overflow: hidden; background: var(--sg-background); }
.ambient { position: absolute; border-radius: 50%; filter: blur(52px); pointer-events: none; }
.ambient--gold { width: 220px; height: 220px; top: -82px; right: -84px; background: rgba(243,215,154,.54); }
.page-header { position: relative; z-index: 1; display: grid; grid-template-columns: 48px 1fr 48px; align-items: center; min-height: 48px; }
.back-button { width: 48px; height: 48px; margin: 0; padding: 0; color: var(--sg-ink); background: transparent; font-size: 36px; line-height: 44px; }
.page-title { font-size: 22px; font-weight: 750; text-align: center; }
.header-space { width: 48px; }

.medicine-hero { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: flex-start; min-height: 290px; margin-top: 18px; padding: 24px; border: 1px solid rgba(255,255,255,.5); border-radius: 26px; background: linear-gradient(135deg,#fff0c8,#f2d184); box-shadow: var(--sg-shadow); }
.medicine-hero--complete { background: linear-gradient(135deg,#e3f1e7,var(--sg-safe-soft)); }
.medicine-mark { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 17px; color: var(--sg-gold-deep); background: rgba(255,253,248,.74); font-size: 18px; font-weight: 750; }
.medicine-time, .medicine-name, .medicine-dose { display: block; }
.medicine-time { margin-top: 30px; font-size: 47px; font-weight: 790; letter-spacing: -1px; }
.medicine-name { margin-top: 7px; font-size: 25px; font-weight: 750; }
.medicine-dose { margin-top: 6px; color: #5d4b2f; font-size: 19px; }
.medicine-status { position: absolute; top: 24px; right: 22px; padding: 8px 11px; border-radius: 12px; color: var(--sg-gold-deep); background: rgba(255,253,248,.72); font-size: 15px; font-weight: 700; }
.medicine-status--completed { color: var(--sg-safe); }
.medicine-status--missed { color: var(--sg-risk); }

.primary-action { position: relative; z-index: 1; width: 100%; margin-top: 22px; }
.secondary-action { position: relative; z-index: 1; width: 100%; margin-top: 12px; }
.contact-card { position: relative; z-index: 1; display: flex; align-items: center; width: 100%; min-height: 66px; margin: 18px 0 0; padding: 10px 14px; border: 1px solid rgba(255,255,255,.76); border-radius: 20px; color: var(--sg-ink); background: rgba(255,253,248,.92); box-shadow: var(--sg-shadow-soft); font-size: 18px; font-weight: 700; text-align: left; }
.contact-mark { display: grid; place-items: center; width: 42px; height: 42px; margin-right: 12px; border-radius: 14px; color: var(--sg-safe); background: var(--sg-safe-soft); }
.contact-arrow { margin-left: auto; color: var(--sg-secondary); font-size: 28px; }
.missed-note { position: relative; z-index: 1; display: block; margin-top: 14px; color: var(--sg-secondary); font-size: 16px; line-height: 1.55; }
.demo-note { position: relative; z-index: 1; display: block; margin-top: 16px; color: var(--sg-secondary); font-size: 12px; text-align: center; }
.missing-card { position: relative; z-index: 1; margin-top: 30px; padding: 24px; border-radius: 22px; background: var(--sg-surface); box-shadow: var(--sg-shadow-soft); }
.missing-title { display: block; font-size: 20px; font-weight: 720; }
.missing-action { width: 100%; margin-top: 20px; }

@media (min-width: 600px) {
  .detail-page { left: 50%; width: 430px; margin-left: -215px; box-shadow: 0 0 40px rgba(35,30,23,.09); }
}
</style>
