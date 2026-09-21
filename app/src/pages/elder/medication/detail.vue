<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import SgButton from '@/components/SgButton.vue';
import SgIcon from '@/components/SgIcon.vue';
import { triggerHaptic } from '@/features/feedback/haptics';
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
  if (update.result === 'updated') triggerHaptic('success');
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
      <button class="back-button" aria-label="返回" @click="goBack"><SgIcon name="chevron-left" :size="25" /></button>
      <text class="page-title">用药提醒</text>
      <view class="header-space" />
    </view>

    <template v-if="plan">
      <view class="medicine-hero" :class="{ 'medicine-hero--complete': plan.status === 'completed' }">
        <view class="medicine-mark"><SgIcon name="pill" :size="28" /></view>
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
        <view class="contact-mark"><SgIcon name="users" :size="23" /></view>
        <text>联系家人</text>
        <view class="contact-arrow"><SgIcon name="chevron-right" :size="22" /></view>
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
.detail-page { position: relative; min-height: 100vh; padding: calc(env(safe-area-inset-top) + 16px) 20px calc(env(safe-area-inset-bottom) + 28px); overflow: hidden; background: radial-gradient(circle at 84% 6%, rgba(245,218,157,.52), transparent 27%), radial-gradient(circle at 5% 76%, rgba(232,190,171,.14), transparent 26%), linear-gradient(160deg,#f9f3e8 0%,var(--sg-background) 58%,#efe4d1 100%); }
.ambient { position: absolute; border-radius: 50%; filter: blur(54px); pointer-events: none; opacity: .7; }
.ambient--gold { width: 220px; height: 220px; top: -82px; right: -84px; background: rgba(229,186,93,.32); }
.page-header { position: relative; z-index: 1; display: grid; grid-template-columns: 48px 1fr 48px; align-items: center; min-height: 48px; animation: sg-detail-rise var(--sg-motion-emphasized) var(--sg-ease-emphasized) both; }
.back-button { display: grid; place-items: center; width: 48px; height: 48px; margin: 0; padding: 0; border: 1px solid var(--sg-border); border-radius: 16px; color: var(--sg-ink); background: linear-gradient(155deg,rgba(255,253,248,.94),rgba(242,233,218,.9)); box-shadow: 0 7px 18px rgba(69,52,31,.08), inset 0 1px var(--sg-highlight); line-height: 48px; transition: transform var(--sg-motion-fast) var(--sg-ease-standard), box-shadow var(--sg-motion-fast) ease; }
.back-button::after { display: none; border: 0; }
.back-button:active { transform: scale(.94); box-shadow: var(--sg-shadow-pressed); }
.page-title { font-size: 22px; font-weight: 750; text-align: center; }
.header-space { width: 48px; }

.medicine-hero { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: flex-start; min-height: 290px; margin-top: 18px; padding: 24px 24px 24px 34px; overflow: hidden; border: 1px solid rgba(130,91,31,.16); border-radius: 30px 30px 30px 10px; background: radial-gradient(circle at 84% 8%,rgba(255,255,255,.52),transparent 28%),linear-gradient(138deg,#faeac2 0%,#edca7e 58%,#dcb25e 100%); box-shadow: var(--sg-shadow), inset 0 1px var(--sg-highlight); animation: sg-detail-stage-in var(--sg-motion-emphasized) 45ms var(--sg-ease-emphasized) both; }
.medicine-hero::before { content: ''; position: absolute; top: 26px; bottom: 26px; left: 16px; width: 3px; border-radius: 3px; background: linear-gradient(rgba(156,105,25,.16), rgba(156,105,25,.72), rgba(156,105,25,.16)); }
.medicine-hero::after { content: ''; position: absolute; width: 190px; height: 190px; right: -76px; bottom: -112px; border: 1px solid rgba(130,91,31,.16); border-radius: 50%; box-shadow: inset 0 0 0 18px rgba(255,255,255,.07); pointer-events: none; }
.medicine-hero--complete { border-color: rgba(34,89,77,.15); background: radial-gradient(circle at 84% 8%,rgba(255,255,255,.52),transparent 28%),linear-gradient(138deg,#e9f3e9,#c8e3d4); }
.medicine-mark { position: relative; z-index: 1; display: grid; place-items: center; width: 52px; height: 52px; border-radius: 17px; color: var(--sg-gold-deep); background: rgba(255,249,234,.64); box-shadow: inset 0 1px rgba(255,255,255,.62), 0 8px 20px rgba(111,78,31,.12); }
.medicine-time, .medicine-name, .medicine-dose { display: block; }
.medicine-time { position: relative; z-index: 1; margin-top: 30px; font-size: 47px; font-weight: 790; letter-spacing: -1px; }
.medicine-name { position: relative; z-index: 1; margin-top: 7px; font-size: 25px; font-weight: 750; }
.medicine-dose { position: relative; z-index: 1; margin-top: 6px; color: #5d4b2f; font-size: 19px; }
.medicine-status { position: absolute; z-index: 1; top: 24px; right: 22px; padding: 8px 11px; border: 1px solid rgba(130,91,31,.14); border-radius: 12px; color: var(--sg-gold-deep); background: rgba(255,249,234,.64); box-shadow: inset 0 1px rgba(255,255,255,.55); font-size: 15px; font-weight: 700; }
.medicine-status--completed { color: var(--sg-safe); }
.medicine-status--missed { color: var(--sg-risk); }

.primary-action { position: relative; z-index: 1; width: 100%; margin-top: 22px; animation: sg-detail-rise var(--sg-motion-emphasized) 95ms var(--sg-ease-emphasized) both; }
.secondary-action { position: relative; z-index: 1; width: 100%; margin-top: 12px; animation: sg-detail-rise var(--sg-motion-emphasized) 125ms var(--sg-ease-emphasized) both; }
.contact-card { position: relative; z-index: 1; display: flex; align-items: center; width: 100%; min-height: 66px; margin: 18px 0 0; padding: 10px 14px; border: 1px solid var(--sg-border); border-radius: 20px; color: var(--sg-ink); background: linear-gradient(155deg,rgba(255,253,248,.97),rgba(244,234,216,.95)); box-shadow: var(--sg-shadow-soft), inset 0 1px var(--sg-highlight); font-size: 18px; font-weight: 700; text-align: left; transition: transform var(--sg-motion-fast) var(--sg-ease-standard), box-shadow var(--sg-motion-fast) ease; animation: sg-detail-rise var(--sg-motion-emphasized) 165ms var(--sg-ease-emphasized) both; }
.contact-card::after { display: none; border: 0; }
.contact-card:active { transform: scale(.985); box-shadow: var(--sg-shadow-pressed); }
.contact-mark { display: grid; place-items: center; width: 42px; height: 42px; margin-right: 12px; border-radius: 14px; color: var(--sg-safe); background: linear-gradient(145deg,#e8f2e9,#cfe4d6); box-shadow: inset 0 1px rgba(255,255,255,.62); }
.contact-arrow { display: grid; place-items: center; margin-left: auto; }
.missed-note { position: relative; z-index: 1; display: block; margin-top: 14px; color: var(--sg-secondary); font-size: 16px; line-height: 1.55; }
.demo-note { position: relative; z-index: 1; display: block; margin-top: 16px; color: var(--sg-secondary); font-size: 12px; text-align: center; }
.missing-card { position: relative; z-index: 1; margin-top: 30px; padding: 24px; border: 1px solid var(--sg-border); border-radius: 22px; background: linear-gradient(155deg,rgba(255,253,248,.97),rgba(244,234,216,.95)); box-shadow: var(--sg-shadow-soft), inset 0 1px var(--sg-highlight); animation: sg-detail-rise var(--sg-motion-emphasized) var(--sg-ease-emphasized) both; }
.missing-title { display: block; font-size: 20px; font-weight: 720; }
.missing-action { width: 100%; margin-top: 20px; }

@keyframes sg-detail-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes sg-detail-stage-in { from { opacity: 0; transform: translateX(-8px) scale(.99); } to { opacity: 1; transform: translateX(0) scale(1); } }

@media (min-width: 600px) {
  .detail-page { left: 50%; width: 430px; margin-left: -215px; box-shadow: 0 0 40px rgba(35,30,23,.09); }
}
</style>
