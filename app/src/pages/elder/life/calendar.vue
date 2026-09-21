<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import SgIcon from '@/components/SgIcon.vue';
import {
  buildMonthDays,
  formatDateTitle,
  formatLunarDate,
  formatMonthTitle,
  fromDateKey,
  toDateKey,
} from '@/features/life/calendar';
import { createScheduleRepository } from '@/features/life/repository';
import type { CalendarDay, ScheduleKind } from '@/features/life/types';

const today = ref(new Date());
const visibleYear = ref(today.value.getFullYear());
const visibleMonth = ref(today.value.getMonth());
const selectedKey = ref(toDateKey(today.value));
const repository = createScheduleRepository();
const allSchedules = ref(repository.listAll());
const weekLabels = ['一', '二', '三', '四', '五', '六', '日'];

const monthTitle = computed(() => formatMonthTitle(visibleYear.value, visibleMonth.value));
const days = computed(() => buildMonthDays(visibleYear.value, visibleMonth.value, today.value));
const selectedDate = computed(() => fromDateKey(selectedKey.value));
const selectedTitle = computed(() => formatDateTitle(selectedDate.value));
const lunarTitle = computed(() => formatLunarDate(selectedDate.value));
const selectedSchedules = computed(() => repository.listByDate(selectedKey.value));
const scheduledDates = computed(() => new Set(allSchedules.value.map((item) => item.date)));

function goBack() {
  uni.navigateBack();
}

function changeMonth(amount: number) {
  const next = new Date(visibleYear.value, visibleMonth.value + amount, 1);
  visibleYear.value = next.getFullYear();
  visibleMonth.value = next.getMonth();
  selectedKey.value = toDateKey(next);
}

function selectDay(day: CalendarDay) {
  selectedKey.value = day.date;
  if (!day.inCurrentMonth) {
    const selected = fromDateKey(day.date);
    visibleYear.value = selected.getFullYear();
    visibleMonth.value = selected.getMonth();
  }
}

function eventIcon(kind: ScheduleKind): 'pill' | 'phone' | 'calendar' | 'clock' {
  if (kind === 'medication') return 'pill';
  if (kind === 'family') return 'phone';
  if (kind === 'appointment') return 'calendar';
  return 'clock';
}

onShow(() => {
  today.value = new Date();
  allSchedules.value = repository.listAll();
});
</script>

<template>
  <view class="calendar-page">
    <view class="ambient ambient--gold" />
    <view class="page-header">
      <button class="back-button" aria-label="返回" @click="goBack"><SgIcon name="chevron-left" :size="25" /></button>
      <text class="page-title">日历日程</text>
      <view class="header-space" />
    </view>

    <view class="month-card">
      <view class="month-toolbar">
        <text class="month-title">{{ monthTitle }}</text>
        <view class="month-actions">
          <button aria-label="上个月" class="month-button" @click="changeMonth(-1)"><SgIcon name="chevron-left" :size="21" /></button>
          <button aria-label="下个月" class="month-button" @click="changeMonth(1)"><SgIcon name="chevron-right" :size="21" /></button>
        </view>
      </view>

      <view class="week-row">
        <text v-for="label in weekLabels" :key="label">{{ label }}</text>
      </view>
      <view class="day-grid">
        <button
          v-for="day in days"
          :key="day.date"
          class="day-cell"
          :class="{
            'day-cell--outside': !day.inCurrentMonth,
            'day-cell--today': day.isToday,
            'day-cell--selected': day.date === selectedKey,
          }"
          :aria-label="day.date"
          @click="selectDay(day)"
        >
          <text>{{ day.day }}</text>
          <view v-if="scheduledDates.has(day.date)" class="schedule-dot" />
        </button>
      </view>
    </view>

    <view class="selected-heading">
      <view>
        <text class="selected-title">{{ selectedTitle }}</text>
        <text class="lunar-title">{{ lunarTitle }}</text>
      </view>
      <text class="count-pill">{{ selectedSchedules.length }} 项</text>
    </view>

    <view v-if="selectedSchedules.length" class="schedule-list">
      <view v-for="item in selectedSchedules" :key="item.id" class="schedule-item">
        <view class="event-icon"><SgIcon :name="eventIcon(item.kind)" :size="22" /></view>
        <view class="event-copy">
          <text class="event-time">{{ item.time }}</text>
          <text class="event-title">{{ item.title }}</text>
        </view>
      </view>
    </view>
    <view v-else class="empty-card">
      <view class="empty-icon"><SgIcon name="calendar" :size="27" /></view>
      <text class="empty-title">这一天没有安排</text>
    </view>

    <text class="demo-note">本地演示安排 · 尚未同步系统日历或家人</text>
  </view>
</template>

<style scoped>
.calendar-page { position: relative; min-height: 100vh; padding: calc(env(safe-area-inset-top) + 16px) 8px calc(env(safe-area-inset-bottom) + 28px); overflow: auto; background: radial-gradient(circle at 84% 6%,rgba(245,218,157,.5),transparent 27%),linear-gradient(160deg,#f9f3e8 0%,var(--sg-background) 58%,#efe4d1 100%); }
.ambient { position:absolute; border-radius:50%; filter:blur(54px); pointer-events:none; opacity:.72; }
.ambient--gold { width:220px; height:220px; top:-82px; right:-84px; background:rgba(229,186,93,.3); }
.page-header { position:relative; z-index:1; display:grid; grid-template-columns:48px 1fr 48px; align-items:center; min-height:48px; margin:0 12px; animation:calendar-rise var(--sg-motion-emphasized) var(--sg-ease-emphasized) both; }
.back-button { display:grid; place-items:center; width:48px; height:48px; margin:0; padding:0; border:1px solid var(--sg-border); border-radius:16px; background:linear-gradient(155deg,rgba(255,253,248,.94),rgba(242,233,218,.9)); box-shadow:0 7px 18px rgba(69,52,31,.08),inset 0 1px var(--sg-highlight); transition:transform var(--sg-motion-fast) var(--sg-ease-standard),box-shadow var(--sg-motion-fast) ease; }
.back-button::after,.month-button::after,.day-cell::after { display:none; border:0; }
.back-button:active { transform:scale(.94); box-shadow:var(--sg-shadow-pressed); }
.page-title { font-size:22px; font-weight:750; text-align:center; }
.header-space { width:48px; }
.month-card { position:relative; z-index:1; margin-top:18px; padding:18px 4px 15px; border:1px solid var(--sg-border); border-radius:28px 28px 28px 10px; background:linear-gradient(155deg,rgba(255,253,248,.98),rgba(244,234,216,.96)); box-shadow:var(--sg-shadow),inset 0 1px var(--sg-highlight); animation:calendar-paper-in var(--sg-motion-emphasized) 45ms var(--sg-ease-emphasized) both; }
.month-toolbar { display:flex; align-items:center; justify-content:space-between; padding:0 10px 14px; }
.month-title { font-size:21px; font-weight:760; }
.month-actions { display:flex; gap:8px; }
.month-button { display:grid; place-items:center; width:44px; height:44px; margin:0; padding:0; border:1px solid var(--sg-border); border-radius:14px; background:linear-gradient(145deg,#fff9ec,#ede0ca); box-shadow:0 5px 12px rgba(69,52,31,.07); transition:transform var(--sg-motion-fast) ease; }
.month-button:active { transform:scale(.94); }
.week-row,.day-grid { display:grid; grid-template-columns:repeat(7,1fr); }
.week-row { margin-bottom:5px; color:var(--sg-secondary); font-size:13px; text-align:center; }
.week-row text { line-height:30px; }
.day-cell { position:relative; display:grid; place-items:center; min-width:42px; height:44px; margin:0; padding:0; border:0; border-radius:14px; color:var(--sg-ink); background:transparent; font-size:16px; font-weight:650; line-height:44px; transition:transform var(--sg-motion-fast) var(--sg-ease-standard),background var(--sg-motion-standard) ease,color var(--sg-motion-standard) ease; }
.day-cell:active { transform:scale(.92); }
.day-cell--outside { color:var(--sg-tertiary); opacity:.54; }
.day-cell--today { box-shadow:inset 0 0 0 1px rgba(128,89,31,.32); }
.day-cell--selected { color:#3d2b13; background:linear-gradient(145deg,#f8e4ae,#e8bd65); box-shadow:0 6px 14px rgba(111,78,31,.15),inset 0 1px rgba(255,255,255,.54); }
.schedule-dot { position:absolute; left:50%; bottom:4px; width:5px; height:5px; margin-left:-2.5px; border-radius:50%; background:var(--sg-safe); }
.day-cell--selected .schedule-dot { background:#5f431a; }
.selected-heading { position:relative; z-index:1; display:flex; align-items:center; justify-content:space-between; margin:24px 14px 12px; animation:calendar-rise var(--sg-motion-emphasized) 90ms var(--sg-ease-emphasized) both; }
.selected-title,.lunar-title { display:block; }
.selected-title { font-size:20px; font-weight:750; }
.lunar-title { margin-top:4px; color:var(--sg-secondary); font-size:14px; }
.count-pill { padding:7px 10px; border-radius:11px; color:var(--sg-gold-deep); background:var(--sg-gold-pale); font-size:14px; font-weight:700; }
.schedule-list { position:relative; z-index:1; display:flex; flex-direction:column; margin:0 12px; padding:4px 14px; overflow:hidden; border:1px solid var(--sg-border); border-radius:20px 20px 20px 8px; background:linear-gradient(155deg,rgba(255,253,248,.97),rgba(244,234,216,.95)); box-shadow:0 10px 24px rgba(61,45,27,.08),inset 0 1px var(--sg-highlight); animation:calendar-list-in var(--sg-motion-emphasized) 130ms var(--sg-ease-emphasized) both; }
.schedule-item { display:flex; align-items:center; min-height:68px; padding:11px 0; border-bottom:1px solid rgba(110,102,90,.13); }
.schedule-item:last-child { border-bottom:0; }
.event-icon { display:grid; place-items:center; width:44px; height:44px; border-radius:14px; background:linear-gradient(145deg,#fff4d8,#efd18e); }
.event-copy { flex:1; padding-left:13px; }
.event-time,.event-title { display:block; }
.event-time { color:var(--sg-gold-deep); font-size:15px; font-weight:740; }
.event-title { margin-top:3px; font-size:18px; font-weight:700; }
.empty-card { position:relative; z-index:1; display:flex; align-items:center; min-height:74px; margin:0 12px; padding:13px 15px; border:1px solid var(--sg-border); border-radius:20px; background:linear-gradient(155deg,rgba(255,253,248,.97),rgba(244,234,216,.95)); box-shadow:var(--sg-shadow-soft),inset 0 1px var(--sg-highlight); animation:calendar-rise var(--sg-motion-emphasized) 130ms var(--sg-ease-emphasized) both; }
.empty-icon { display:grid; place-items:center; width:46px; height:46px; margin-right:13px; border-radius:15px; background:var(--sg-gold-pale); }
.empty-title { color:var(--sg-secondary); font-size:17px; font-weight:650; }
.demo-note { position:relative; z-index:1; display:block; margin:15px 12px 0; color:var(--sg-secondary); font-size:12px; text-align:center; }
@keyframes calendar-rise { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
@keyframes calendar-paper-in { from { opacity:0; transform:translateY(8px) rotate(-.25deg); } to { opacity:1; transform:translateY(0) rotate(0); } }
@keyframes calendar-list-in { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
@media (min-width:600px) { .calendar-page { left:50%; width:430px; margin-left:-215px; box-shadow:0 0 40px rgba(35,30,23,.09); } }
</style>
