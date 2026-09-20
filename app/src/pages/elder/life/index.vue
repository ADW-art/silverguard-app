<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import SgIcon from '@/components/SgIcon.vue';
import { formatDateTitle, toDateKey } from '@/features/life/calendar';
import { createDemoSchedule } from '@/features/life/repository';
import type { ScheduleItem } from '@/features/life/types';

const now = ref(new Date());
const schedules = ref<ScheduleItem[]>([]);
const todayKey = computed(() => toDateKey(now.value));
const todayItems = computed(() => schedules.value.filter((item) => item.date === todayKey.value));
const nextItem = computed(() => schedules.value
  .filter((item) => item.date >= todayKey.value)
  .sort((left, right) => `${left.date} ${left.time}`.localeCompare(`${right.date} ${right.time}`))[0]);

const tools = [
  { id: 'flashlight', title: '手电筒', icon: 'flashlight', tone: 'gold' },
  { id: 'calendar', title: '日历日程', icon: 'calendar', tone: 'gold' },
  { id: 'magnifier', title: '放大镜', icon: 'magnifier', tone: 'green' },
  { id: 'calculator', title: '大字计算器', icon: 'calculator', tone: 'green' },
] as const;

function refresh() {
  now.value = new Date();
  schedules.value = createDemoSchedule(now.value);
}

function openTool(id: typeof tools[number]['id']) {
  if (id === 'calendar') {
    uni.navigateTo({ url: '/pages/elder/life/calendar' });
    return;
  }
  if (id === 'calculator') {
    uni.navigateTo({ url: '/pages/elder/life/calculator' });
    return;
  }
  const title = tools.find((tool) => tool.id === id)?.title ?? '此工具';
  uni.showModal({
    title,
    content: '该功能需要 Android 设备能力，完成权限和设备验证后开放。',
    showCancel: false,
    confirmText: '我知道了',
  });
}

function goHome() {
  uni.reLaunch({ url: '/pages/elder/home' });
}

onShow(refresh);
</script>

<template>
  <view class="life-page">
    <view class="ambient ambient--gold" />
    <view class="ambient ambient--green" />

    <view class="page-header">
      <view>
        <text class="eyebrow">银龄智护</text>
        <text class="page-title">生活</text>
      </view>
      <view class="today-pill"><SgIcon name="calendar" :size="19" /><text>今天</text></view>
    </view>

    <view class="date-card" @click="openTool('calendar')">
      <view>
        <text class="date-title">{{ formatDateTitle(now) }}</text>
        <text class="date-summary">今天有 {{ todayItems.length }} 项安排</text>
      </view>
      <view class="date-icon"><SgIcon name="calendar" :size="30" /></view>
    </view>

    <text class="section-title">常用工具</text>
    <view class="tool-grid">
      <button
        v-for="tool in tools"
        :key="tool.id"
        class="tool-card"
        :class="`tool-card--${tool.tone}`"
        @click="openTool(tool.id)"
      >
        <view class="tool-icon"><SgIcon :name="tool.icon" :size="29" /></view>
        <text class="tool-title">{{ tool.title }}</text>
      </button>
    </view>

    <text class="section-title section-title--next">接下来</text>
    <view v-if="nextItem" class="next-card" @click="openTool('calendar')">
      <view class="next-time"><text>{{ nextItem.time }}</text></view>
      <view class="next-copy">
        <text class="next-title">{{ nextItem.title }}</text>
        <text class="next-meta">{{ nextItem.date === todayKey ? '今天' : nextItem.date.slice(5).replace('-', '月') + '日' }}</text>
      </view>
      <view class="next-arrow"><SgIcon name="chevron-right" :size="22" /></view>
    </view>

    <text class="demo-note">本地演示安排 · 尚未同步系统日历或家人</text>

    <view class="bottom-nav">
      <view class="nav-item" @click="goHome"><view class="nav-mark"><SgIcon name="home" :size="20" /></view><text>首页</text></view>
      <view class="nav-item nav-item--active"><view class="nav-mark"><SgIcon name="calendar" :size="20" /></view><text>生活</text></view>
      <view class="nav-item"><view class="nav-mark"><SgIcon name="bell" :size="20" /></view><text>消息</text></view>
      <view class="nav-item"><view class="nav-mark"><SgIcon name="user" :size="20" /></view><text>我的</text></view>
    </view>
  </view>
</template>

<style scoped>
.life-page { position: relative; min-height: 100vh; padding: calc(env(safe-area-inset-top) + 18px) 20px calc(env(safe-area-inset-bottom) + 92px); overflow: hidden; background: radial-gradient(circle at 84% 7%,rgba(245,218,157,.52),transparent 27%),radial-gradient(circle at 5% 78%,rgba(150,190,169,.14),transparent 25%),linear-gradient(160deg,#f9f3e8 0%,var(--sg-background) 58%,#efe4d1 100%); }
.ambient { position: absolute; border-radius: 50%; filter: blur(54px); pointer-events: none; opacity: .72; }
.ambient--gold { width: 220px; height: 220px; top: -82px; right: -86px; background: rgba(229,186,93,.32); }
.ambient--green { width: 170px; height: 170px; left: -108px; bottom: 120px; background: rgba(124,174,151,.18); }
.page-header { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; min-height: 54px; animation: life-rise var(--sg-motion-emphasized) var(--sg-ease-emphasized) both; }
.eyebrow { display: block; margin-bottom: 3px; color: var(--sg-gold-deep); font-size: 13px; font-weight: 650; letter-spacing: 1px; }
.page-title { display: block; font-size: 28px; font-weight: 760; }
.today-pill { display: flex; align-items: center; gap: 7px; padding: 9px 13px; border: 1px solid var(--sg-border); border-radius: 999px; color: var(--sg-gold-deep); background: linear-gradient(155deg,rgba(255,253,248,.94),rgba(242,233,218,.9)); box-shadow: 0 7px 18px rgba(69,52,31,.08),inset 0 1px var(--sg-highlight); font-size: 14px; font-weight: 700; }
.date-card { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; min-height: 126px; margin-top: 18px; padding: 22px; overflow: hidden; border: 1px solid rgba(130,91,31,.16); border-radius: var(--sg-radius-hero); background: radial-gradient(circle at 84% 8%,rgba(255,255,255,.5),transparent 28%),linear-gradient(138deg,#faeac2 0%,#edca7e 58%,#dcb25e 100%); box-shadow: var(--sg-shadow),inset 0 1px var(--sg-highlight); transition: transform var(--sg-motion-fast) var(--sg-ease-standard),box-shadow var(--sg-motion-fast) ease; animation: life-rise var(--sg-motion-emphasized) 45ms var(--sg-ease-emphasized) both; }
.date-card:active { transform: scale(.985); box-shadow: var(--sg-shadow-pressed); }
.date-title,.date-summary { display: block; }
.date-title { font-size: 23px; font-weight: 760; }
.date-summary { margin-top: 9px; color: #5d4b2f; font-size: 16px; }
.date-icon { display: grid; place-items: center; width: 62px; height: 62px; border-radius: 20px; background: rgba(255,249,234,.58); box-shadow: inset 0 1px rgba(255,255,255,.62),0 8px 20px rgba(111,78,31,.12); }
.section-title { position: relative; z-index: 1; display: block; margin: 24px 0 12px; font-size: 20px; font-weight: 750; animation: life-rise var(--sg-motion-emphasized) 90ms var(--sg-ease-emphasized) both; }
.section-title--next { margin-top: 22px; }
.tool-grid { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 13px; animation: life-rise var(--sg-motion-emphasized) 120ms var(--sg-ease-emphasized) both; }
.tool-card { display: flex; flex-direction: column; align-items: flex-start; justify-content: space-between; min-height: 108px; margin: 0; padding: 15px; border: 1px solid var(--sg-border); border-radius: 20px; color: var(--sg-ink); background: linear-gradient(155deg,rgba(255,253,248,.97),rgba(244,234,216,.95)); box-shadow: var(--sg-shadow-soft),inset 0 1px var(--sg-highlight); text-align: left; transition: transform var(--sg-motion-fast) var(--sg-ease-standard),box-shadow var(--sg-motion-fast) ease,filter var(--sg-motion-fast) ease; }
.tool-card::after { display: none; border: 0; }
.tool-card:active { transform: scale(var(--sg-press-scale)); box-shadow: var(--sg-shadow-pressed); filter: brightness(.97); }
.tool-card--gold { background: linear-gradient(150deg,#fff6dd,#f1d99f); }
.tool-card--green { background: linear-gradient(150deg,#f7f6eb,#dce8d9); }
.tool-icon { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 14px; background: rgba(255,252,243,.7); box-shadow: inset 0 1px rgba(255,255,255,.64),0 4px 12px rgba(75,53,27,.07); }
.tool-title { font-size: 18px; font-weight: 720; }
.next-card { position: relative; z-index: 1; display: flex; align-items: center; min-height: 72px; padding: 12px 14px; border: 1px solid var(--sg-border); border-radius: 20px; background: linear-gradient(155deg,rgba(255,253,248,.97),rgba(244,234,216,.95)); box-shadow: var(--sg-shadow-soft),inset 0 1px var(--sg-highlight); transition: transform var(--sg-motion-fast) var(--sg-ease-standard),box-shadow var(--sg-motion-fast) ease; animation: life-rise var(--sg-motion-emphasized) 165ms var(--sg-ease-emphasized) both; }
.next-card:active { transform: scale(.985); box-shadow: var(--sg-shadow-pressed); }
.next-time { display: grid; place-items: center; width: 64px; height: 46px; border-radius: 14px; background: linear-gradient(145deg,#f9e7b9,#edcb7e); font-size: 17px; font-weight: 760; }
.next-copy { flex: 1; min-width: 0; padding-left: 13px; }
.next-title,.next-meta { display: block; }
.next-title { font-size: 18px; font-weight: 700; }
.next-meta { margin-top: 3px; color: var(--sg-secondary); font-size: 14px; }
.next-arrow { display: grid; place-items: center; }
.demo-note { position: relative; z-index: 1; display: block; margin-top: 13px; color: var(--sg-secondary); font-size: 12px; text-align: center; }
.bottom-nav { position: fixed; z-index: 5; left: 12px; right: 12px; bottom: calc(env(safe-area-inset-bottom) + 10px); display: grid; grid-template-columns: repeat(4,1fr); padding: 8px 6px 7px; border: 1px solid var(--sg-border); border-radius: 22px; background: linear-gradient(155deg,rgba(255,253,248,.96),rgba(242,233,218,.94)); box-shadow: 0 14px 32px rgba(58,43,27,.15),inset 0 1px var(--sg-highlight); backdrop-filter: blur(14px); animation: life-nav 420ms 170ms var(--sg-ease-emphasized) both; }
.nav-item { display: flex; flex-direction: column; align-items: center; gap: 2px; color: var(--sg-secondary); font-size: 11px; }
.nav-mark { display: grid; place-items: center; width: 42px; height: 31px; border-radius: 15px; transition: background var(--sg-motion-standard) ease,transform var(--sg-motion-standard) var(--sg-ease-emphasized); }
.nav-item--active { color: var(--sg-gold-deep); font-weight: 700; }
.nav-item--active .nav-mark { background: linear-gradient(145deg,#f9e7b9,#edcb7e); box-shadow: inset 0 1px rgba(255,255,255,.55); transform: translateY(-1px); }
@keyframes life-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes life-nav { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
@media (min-width:600px) { .life-page { left:50%; width:430px; margin-left:-215px; box-shadow:0 0 40px rgba(35,30,23,.09); } }
</style>
