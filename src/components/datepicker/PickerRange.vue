<template>
  <div
    :class="['vuejs3-datepicker__calendar', `vuejs3-${theme}`, calendarClass]"
    v-show="showRangeView"
    :style="calendarStyle"
    @mousedown.prevent
  >
    <slot name="customCalendarHeader"></slot>
    <section class="vuejs3-datepicker__calendar-topbar">
      <p class="vuejs3-datepicker__calendar-topbar-year">{{ currYearName }}</p>
      <div class="vuejs3-datepicker__calendar-topbar-day">
        <span>{{ getStartDate }}</span>
        <span>-</span>
        <span>{{ getEndDate }}</span>
      </div>
    </section>
    <div class="vuejs3-datepicker__calendar-actionarea">
      <header>
        <span @click="isRtl ? nextMonth() : previousMonth()" class="prev" :class="{ disabled: isLeftNavDisabled }"
          >&lt;</span
        >
        <span class="day__month_btn" :class="allowedToShowView('month') ? 'up' : ''"
          >{{ isYmd ? currYearName : currMonthName }} {{ isYmd ? currMonthName : currYearName }}</span
        >
        <span @click="isRtl ? previousMonth() : nextMonth()" class="next" :class="{ disabled: isRightNavDisabled }"
          >&gt;</span
        >
      </header>
      <div :class="isRtl ? 'flex-rtl' : ''">
        <span
          v-for="(day, i) in daysOfWeek"
          :key="'week-day-' + i"
          :title="day"
          class="cell day-header"
          role="columnheader"
        >
          {{ day }}
        </span>
        <div v-for="(weeks, wIndex) in days" :key="'week-' + wIndex" role="row">
          <button
            type="button"
            v-for="(day, dIndex) in weeks"
            :key="'week-' + wIndex + 'day-' + dIndex"
            :class="dayClasses(day)"
            class="cell day"
            role="gridcell"
            @click="selectDate(day)"
            style="background:transparent;"
          >
            <time :datetime="day.iso">
              {{
                day.iso
                  .split('-')
                  .pop()
                  .replace(/^0/, '')
              }}
            </time>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { chunk, getDates } from './utils/WueDates';
import {
  compareDates,
  formatDate,
  getDate,
  getDay,
  getDayNameAbbr,
  getFullYear,
  getMonth,
  getMonthName,
  getMonthNameAbbr,
  setMonth,
  stringToDate,
} from './utils/DateUtils';

interface IDays {
  date: number;
  iso: string;
  type: string;
  timestamp: number;
  isSelectedStart: boolean;
  isSelectedEnd: boolean;
  isDisabled: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isToday: boolean;
  isWeekend: boolean;
  isSaturday: boolean;
  isSunday: boolean;
}

export default defineComponent({
  name: 'PickerRange',
  props: {
    showRangeView: {
      type: Boolean,
    },
    selectedDate: {
      type: Object,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: {
        start: null,
        end: null,
      },
    },
    pageDate: {
      type: Date as PropType<Date>,
      default: new Date(),
    },
    pageTimestamp: {
      type: Number,
    },
    fullMonthName: {
      type: Boolean,
    },
    allowedToShowView: {
      type: Function,
    },
    dayCellContent: {
      type: Function,
      default: (day: { date: Date }): Date => day.date,
    },
    disabledDates: {
      type: Object,
    },
    highlighted: {
      type: Object,
    },
    calendarClass: {
      type: [String, Object, Array],
    },
    calendarStyle: {
      type: Object,
    },
    translation: {
      type: Object,
    },
    format: {
      type: [String, Function],
      default: 'dd MMM yyyy',
    },
    isRtl: {
      type: Boolean,
    },
    mondayFirst: {
      type: Boolean,
    },
    useUtc: {
      type: Boolean,
    },
    minimumView: {
      type: String,
      default: 'day',
    },
    maximumView: {
      type: String,
      default: 'year',
    },
    preventDisableDateSelection: {
      type: Boolean,
      default: true,
    },
    theme: {
      default: 'green',
      type: String,
    },
  },
  emits: ['show-year-calendar', 'changed-month', 'show-month-calendar', 'selected-disabled', 'select-date'],
  setup(props, { emit }) {
    /** ********************************** Methods *********************************** */
    /**
     * Whether a day is highlighted and it is the first date
     * in the highlighted range of dates
     * @param date
     */
    function selectDate(date: { isDisabled: any }): void {
      if (date.isDisabled) {
        emit('selected-disabled', date);
        if (!props.preventDisableDateSelection) {
          emit('select-date', date);
        }
      } else {
        emit('select-date', date);
      }
    }

    /**
     * Emit an event to show the month picker
     */
    function showMonthCalendar(): void {
      emit('show-month-calendar');
    }

    /**
     * Emit an event to show the year picker
     */
    function showYearCalendar(): void {
      emit('show-year-calendar');
    }
    /**
     * Change the page month
     * @param {Number} incrementBy
     */
    function changeMonth(incrementBy: number): void {
      const date: Date = props.pageDate;
      setMonth(date, getMonth(date) + incrementBy);
      emit('changed-month', date);
    }

    /**
     * Is the previous month disabled?
     * @return {Boolean}
     */
    function isPreviousMonthDisabled(): boolean {
      const d = props.disabledDates;
      if (!d || !d.to) {
        return false;
      }
      const t = props.pageDate;
      return getMonth(d.to) >= getMonth(t) && getFullYear(d.to) >= getFullYear(t);
    }

    /**
     * Decrement the page month
     */
    function previousMonth(): void {
      if (!isPreviousMonthDisabled()) {
        changeMonth(-1);
      }
    }

    /**
     * Is the next month disabled?
     * @return {Boolean}
     */
    function isNextMonthDisabled(): boolean {
      const d = props.disabledDates;
      if (!d || !d.from) {
        return false;
      }
      const t = props.pageDate;
      return getMonth(d.from) <= getMonth(t) && getFullYear(d.from) <= getFullYear(t);
    }

    /**
     * Increment the current page month
     */
    function nextMonth(): void {
      if (!isNextMonthDisabled()) {
        changeMonth(+1);
      }
    }
    /**
     * Whether a start day is selected
     * @return {Boolean}
     * @param dObj
     */
    function isSelectedStart(dObj: Date): boolean {
      const propDate = stringToDate(props.selectedDate.start);
      return props.selectedDate.start ? compareDates(propDate, dObj) : false;
    }

    /**
     * Whether a end day is selected
     * @return {Boolean}
     * @param dObj
     */
    function isSelectedEnd(dObj: Date): boolean {
      const propDate = stringToDate(props.selectedDate.end);
      return props.selectedDate.end ? compareDates(propDate, dObj) : false;
    }

    /**
     * Whether a date is disabled
     * @return {Boolean}
     */
    function isDisabledDate(date: number | Date): boolean {
      let disabledDates = false;
      const t = props.disabledDates;

      if (!t) return disabledDates;

      if (typeof t === 'undefined') {
        return false;
      }

      if (typeof t.dates !== 'undefined') {
        t.dates.forEach((d: { getTime: () => string | number | Date }): void => {
          const isEqual = compareDates(date as Date, d);
          if (isEqual) {
            disabledDates = true;
            // return true;
          }
        });
      }
      if (typeof t.to !== 'undefined' && t.to && date < t.to) {
        disabledDates = true;
      }
      if (typeof t.from !== 'undefined' && t.from && date > t.from) {
        disabledDates = true;
      }
      if (typeof t.ranges !== 'undefined') {
        t.ranges.forEach((range: { from: number; to: number }): void => {
          if (typeof range.from !== 'undefined' && range.from && typeof range.to !== 'undefined' && range.to) {
            if (date < range.to && date > range.from) {
              disabledDates = true;
              // return true;
            }
          }
        });
      }
      if (typeof t.days !== 'undefined' && t.days.indexOf(getDay(date as Date)) !== -1) {
        disabledDates = true;
      }
      if (typeof t.daysOfMonth !== 'undefined' && t.daysOfMonth.indexOf(getDate(date as Date)) !== -1) {
        disabledDates = true;
      }
      if (typeof t.customPredictor === 'function' && t.customPredictor(date)) {
        disabledDates = true;
      }
      return disabledDates;
    }

    /**
     * Helper
     * @param  {mixed}  prop
     * @return {Boolean}
     */
    function isDefined(prop: any): any {
      return typeof prop !== 'undefined' && prop;
    }

    /**
     * Whether a day is in range or not
     * @return {Boolean}
     * @param date
     */
    function isInRange(date: Date): boolean {
      const { start, end } = props.selectedDate;
      if (
        !(start && start.includedDisabled) &&
        isDisabledDate(date) &&
        !(end && end.includedDisabled) &&
        isDisabledDate(date)
      ) {
        return false;
      }

      let inRange = false;

      if (typeof start === 'undefined' && typeof end === 'undefined') {
        return false;
      }

      if (isDefined(start) && isDefined(end)) {
        inRange = date >= start && date <= end;
      }

      return inRange;
    }

    /**
     * Returns Css Classes for a day element
     */
    function dayClasses(day: {
      isSelected: any;
      isDisabled: any;
      isInRange: any;
      isToday: any;
      isWeekend: any;
      isSaturday: any;
      isSunday: any;
      isRangeStart: any;
      isRangeEnd: any;
      type: string;
    }): any {
      return {
        selected: day.isSelected,
        disabled: day.isDisabled,
        today: day.isToday,
        weekend: day.isWeekend,
        sat: day.isSaturday,
        sun: day.isSunday,
        'not-current': day.type !== 'current',
        highlighted: day.isInRange,
        'highlight-start': day.isRangeStart,
        'highlight-end': day.isRangeEnd,
      };
    }

    /**
     * Whether a day is in range and it is the first date
     * in the highlighted range of dates
     * @return {Boolean}
     * @param date
     */
    function isRangeStart(date: Date): boolean {
      const { start } = props.selectedDate;
      if (!start) return false;
      return (
        isInRange(date) &&
        start instanceof Date &&
        getFullYear(start) === getFullYear(date) &&
        getMonth(start) === getMonth(date) &&
        getDate(start) === getDate(date)
      );
    }

    /**
     * Whether a day is in range, and it is the end date
     * @return {Boolean}
     * @param date
     */
    function isRangeEnd(date: Date): boolean {
      const { end } = props.selectedDate;
      if (!end) return false;
      return (
        isInRange(date) &&
        end instanceof Date &&
        getFullYear(end) === getFullYear(date) &&
        getMonth(end) === getMonth(date) &&
        getDate(end) === getDate(date)
      );
    }

    /** ********************************** Computed  *********************************** */

    /**
     * Returns formatted value of selected start date
     */
    const getStartDate = computed(() => {
      const { start } = props.selectedDate;
      return start ? formatDate(start, props.format as any, props.translation as any) : null;
    });

    /**
     * Returns formatted value of selected end date
     */
    const getEndDate = computed(() => {
      const { end } = props.selectedDate;
      return end ? formatDate(end, props.format as any, props.translation as any) : null;
    });

    /**
     * Returns an array of day names
     * @return {String[]}
     */
    const daysOfWeek = computed(() => {
      if (props.mondayFirst) {
        const tempDays = props.translation && props.translation.days && props.translation.days.slice();
        tempDays.push(tempDays.shift());
        return tempDays;
      }
      return props.translation && props.translation.days;
    });

    const blankDays = computed(() => {
      const d = props.pageDate;
      const dObj = props.useUtc
        ? new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
        : new Date(d.getFullYear(), d.getMonth(), 1, d.getHours(), d.getMinutes());
      if (props.mondayFirst) {
        return getDay(dObj) > 0 ? getDay(dObj) - 1 : 6;
      }
      return getDay(dObj);
    });

    const days = computed(() => {
      const d = props.pageDate;

      const dObj = props.useUtc
        ? new Date(Date.UTC(d?.getUTCFullYear(), d?.getUTCMonth(), 1))
        : new Date(d?.getFullYear(), d?.getMonth(), 1, d?.getHours(), d?.getMinutes());

      const dates = getDates(dObj).map((date: any) => {
        let obj;
        switch (date.type) {
          case 'previous':
            obj = props.useUtc
              ? new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, date.date))
              : new Date(d.getFullYear(), d.getMonth() - 1, date.date, d.getHours(), d.getMinutes());
            break;
          case 'next':
            obj = props.useUtc
              ? new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, date.date))
              : new Date(d.getFullYear(), d.getMonth() + 1, date.date, d.getHours(), d.getMinutes());
            break;
          default:
            obj = props.useUtc
              ? new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), date.date))
              : new Date(d.getFullYear(), d.getMonth(), date.date, d.getHours(), d.getMinutes());
        }

        const iDay: IDays = {
          date: date.date,
          iso: date.iso,
          timestamp: obj.getTime(),
          isWeekend: date.sun || date.sat,
          isSunday: date.sun,
          isSaturday: date.sat,
          type: date.type,
          isSelectedStart: isSelectedStart(dObj),
          isSelectedEnd: isSelectedEnd(dObj),
          isDisabled: isDisabledDate(dObj),
          isInRange: isInRange(dObj),
          isRangeStart: isRangeStart(dObj),
          isRangeEnd: isRangeEnd(dObj),
          isToday: compareDates(dObj, new Date(), props.useUtc),
        };
        return iDay;
      });

      return chunk(dates, 7);
    });

    /**
     * @return {Object[]}
     */
    // const days = computed((): IDays[] => {
    //   const d = props.pageDate;
    //   const tdays: IDays[] = [];
    //   // set up a new date object to the beginning of the current 'page'
    //   const dObj = props.useUtc
    //     ? new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
    //     : new Date(d.getFullYear(), d.getMonth(), 1, d.getHours(), d.getMinutes());
    //   const t = daysInMonth(getFullYear(dObj), getMonth(dObj));
    //   for (let i = 0; i < t; i += 1) {
    //     tdays.push({
    //       date: getDate(dObj),
    //       timestamp: dObj.getTime(),
    //       isSelectedStart: isSelectedStart(dObj),
    //       isSelectedEnd: isSelectedEnd(dObj),
    //       isDisabled: isDisabledDate(dObj),
    //       isInRange: isInRange(dObj),
    //       isRangeStart: isRangeStart(dObj),
    //       isRangeEnd: isRangeEnd(dObj),
    //       isToday: compareDates(dObj, new Date()),
    //       isWeekend: getDay(dObj) === 0 || getDay(dObj) === 6,
    //       isSaturday: getDay(dObj) === 6,
    //       isSunday: getDay(dObj) === 0,
    //     });
    //     setDate(dObj, getDate(dObj) + 1);
    //   }
    //   return tdays;
    // });

    /**
     * Gets the name of the month the current page is on
     * @return {String}
     */
    const currMonthName = computed(() => {
      const monthName = props.fullMonthName
        ? props.translation && props.translation.months
        : props.translation && props.translation.monthsAbbr;
      return getMonthNameAbbr(getMonth(props.pageDate), monthName);
    });

    /**
     * Gets the name of the month the current page is on
     * @return {String}
     */
    const monthName = computed(() => {
      const tempName = props.translation && props.translation.months;
      return getMonthName(getMonth(props.pageDate), tempName);
    });

    /**
     * Gets the name of the year that current page is on
     * @return {Number}
     */
    const currYearName = computed(() => {
      const yearSuffix = props.translation && props.translation.yearSuffix;
      return `${getFullYear(props.pageDate)}${yearSuffix}`;
    });

    /**
     * Is this translation using year/month/day format?
     * @return {Boolean}
     */
    const isYmd = computed(() => {
      return (props.translation && props.translation.ymd && props.translation && props.translation.ymd) === true;
    });

    /**
     * Is the left hand navigation button disabled?
     * @return {Boolean}
     */
    const isLeftNavDisabled = computed(() => {
      return props.isRtl ? isNextMonthDisabled() : isPreviousMonthDisabled();
    });
    /**
     * Is the right hand navigation button disabled?
     * @return {Boolean}
     */
    const isRightNavDisabled = computed(() => {
      return props.isRtl ? isPreviousMonthDisabled() : isNextMonthDisabled();
    });

    const getDayName = computed(() => {
      const propDate = stringToDate(props.selectedDate);
      return props.selectedDate ? getDayNameAbbr(propDate, props.translation && props.translation.daysNames) : null;
    });

    const getDisplayDate = computed(() => {
      const propDate = stringToDate(props.selectedDate);
      return props.selectedDate ? getDate(propDate) : null;
    });

    return {
      isDefined,
      showMonthCalendar,
      daysOfWeek,
      blankDays,
      isYmd,
      days,
      currMonthName,
      currYearName,
      isLeftNavDisabled,
      isRightNavDisabled,
      selectDate,
      previousMonth,
      nextMonth,
      dayClasses,
      getStartDate,
      getEndDate,
      monthName,
      getDayName,
      getDisplayDate,
      showYearCalendar,
      isNextMonthDisabled,
      isSelectedStart,
      isSelectedEnd,
      isDisabledDate,
      isInRange,
      isRangeStart,
      isRangeEnd,
    };
  },
});
</script>
