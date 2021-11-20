<template>
  <div class="schedule-page">
    <h2 class="page-header">Schedule</h2>
    <div
      v-if="dataLoaded"
      class="schedule-list"
    >
      <ScheduleCarousel
        title="My Saved Events"
        style="margin-top: -6rem"
        v-if="rawEvents.some((event) => event.addedToUserList)"
        :useSavedEvents="true"
        :selectedEvent="selectedEvent"
        :dataLoaded="dataLoaded"
        :rawEvents="rawEvents.filter((event) => event.addedToUserList)"
        @openScheduleModal="openScheduleModalDirect"
      />
      <div class="schedule-list-title">
        <span
          v-for="day in days"
          :key="getDayOfTheWeek(day)"
          class="schedule-list-title-item"
          :class="{ 'schedule-list-title-item-selected': day === selectedDay }"
          @click="selectTitleItem(day)"
        >{{ getDayOfTheWeek(day).toUpperCase() }}</span>
      </div>
      <div style="margin-top: 1.5rem; text-align: left; margin-left: 3rem">
        <b>Key: <span class="main-event-text">Main Events</span>,
          <span class="workshop-text">Workshops</span>,
          <span class="mini-event-text">Food and Mini-Events</span>,
          <span class="demo-text"> Demo Events</span>
        </b>
        <div
          v-if="timezoneDisplayName"
          style="margin-top: 0.5rem"
        >
          The schedule below is displayed in your current time zone:
          <b>{{ timezoneDisplayName }}</b>
        </div>
      </div>
      <div class="schedule-wrapper">
        <div
          id="schedule-body"
          class="schedule-body"
        >
          <div class="schedule-time">
            <div
              v-for="timeWindow in displayTimeWindows"
              :key="timeWindow"
              class="timewindow"
            >
              {{ timeWindow }}
              <div
                v-if="
                timeWindow === getScheduleTimeLineWindow &&
                new Date().getDay() === selectedDay.getDay()
              "
                class="schedule-time-line"
              >
                <div class="schedule-time-line-header"></div>
                <div class="schedule-time-line-inner"></div>
              </div>
            </div>
          </div>
          <div class="schedule-content">
            <div
              v-for="scheduleColumn in scheduleColumns"
              :key="scheduleColumn"
              class="schedule-column"
            >
              <div
                v-for="timeWindow in displayTimeWindows"
                :key="timeWindow"
                class="timewindow"
              >
                <div
                  v-if="
                    formattedEvents[selectedDay][timeWindow].find(
                      (event) => event.column === scheduleColumn
                    )
                  "
                  @click="
                    openScheduleModal(selectedDay, timeWindow, scheduleColumn)
                  "
                  class="schedule-content-item"
                  :class="
                    formattedEvents[selectedDay][timeWindow].find(
                      (event) => event.column === scheduleColumn
                    ).branding.class
                  "
                >
                  <div class="schedule-content-item-star">
                    <img
                      :src="
                        getFavoriteIconForEvent(
                          formattedEvents[selectedDay][timeWindow].find(
                            (event) => event.column === scheduleColumn
                          )
                        )
                      "
                      @click.stop="
                        toggleEventInList(
                          formattedEvents[selectedDay][timeWindow].find(
                            (event) => event.column === scheduleColumn
                          )
                        )
                      "
                      style="width: 19px; height: 18px"
                    />
                  </div>
                  <div class="schedule-content-item-title">
                    {{
                      formattedEvents[selectedDay][timeWindow].find(
                        (event) => event.column === scheduleColumn
                      ).event_name
                    }}
                  </div>
                  <div class="schedule-content-item-horizons-icon">
                    <!-- TODO: Figure out what we're doing about Expand Your Horizons -->
                    <!-- <img
                      v-if="
                        formattedEvents[selectedDay][timeWindow].find(
                          (event) => event.column === scheduleColumn
                        ).display_horizons_icon
                      "
                      src="../assets/horizons_icon_white.svg"
                      style="width: 19px; height: 18px; margin-right: 0.5rem"
                    /> -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    <LoadingSpinner v-else />
    <EventModal
      :selectedEvent="selectedEvent"
      :handleListToggle="toggleEventInList"
    />
    <EasterEgg
          :index=3
          :hint="'We seriously need to make this harder. But before giving the next Techniclue, explore the different mini-events, workshops, and other events Technica has to offer! Ready now? Here is the next Techniclue: convert the following binary into ASCII to know where the next character is located: 01101000 01100001 01100011 01101011.'"
          :fileName="'scavenger-hunt/4.png'"
        />
  </div>
</template>

<script>
import ScheduleCarousel from '@/components/ScheduleCarousel.vue';
import generalMixin from '../mixins/general';
import scheduleMixin from '../mixins/schedule';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import EventModal from '../components/EventModal.vue';
import EasterEgg from '../components/EasterEgg.vue';

export default {
  name: 'Schedule',
  mixins: [generalMixin, scheduleMixin],
  components: {
    LoadingSpinner,
    ScheduleCarousel,
    EventModal,
    EasterEgg,
  },
  data() {
    return {
      rawEvents: [],
      formattedEvents: {},
      eventsInUserList: [],
      selectedDay: null,
      days: [],
      timeWindows: [],
      scheduleColumns: 4,
      dataLoaded: false,
      selectedEvent: {},
      startDate: new Date(this.getEnvVariable('START_DATE')),
      endDate: new Date(this.getEnvVariable('END_DATE')),
      targetEventId: null,
    };
  },
  async mounted() {
    this.targetEventId = this.$route.query.event;
    this.prepareTimeWindows();
    this.populateDays();
    [this.rawEvents] = await Promise.all([
      this.getData(
        this.getEnvVariable('BACKEND'),
        'schedule',
      ),
      this.getEventsFromUserList(),
    ]);
    console.log(this.rawEvents);
    this.processRawEvents();
    this.dataLoaded = true;
    if (
      this.targetEventId
      && this.rawEvents.find((event) => event.id === this.targetEventId)
    ) {
      this.openScheduleModalDirect(
        this.rawEvents.find((event) => event.id === this.targetEventId),
      );
    }
    this.activityTracking('SCHEDULE');
  },
  computed: {
    timezoneIsUSEastern() {
      const offset = new Date().getTimezoneOffset();
      return offset === 240; // 240 is the offset for us eastern time zone
    },
    displayTimeWindows() {
      const daySchedule = this.formattedEvents[this.selectedDay];
      const keys = Object.keys(this.formattedEvents[this.selectedDay]);
      const topExtraRows = 1;
      const bottomExtraRows = 4;
      let startCutoff = 0;
      let endCutoff = -1;
      // 1. trim at the top
      for (let i = 0; i < keys.length; i += 1) {
        if (daySchedule[keys[i]].length !== 0) {
          startCutoff = Math.max(i - topExtraRows, 0);
          break;
        }
      }

      // 2. trim at the bottom
      const newTimes = [];
      for (let i = keys.length - 1; i >= 0; i -= 1) {
        if (daySchedule[keys[i]].length !== 0) {
          /* Check for events that overflow the end of the time windows */
          endCutoff = i + bottomExtraRows;

          if (endCutoff >= this.timeWindows.length) {
            // Add additional time windows to the end to support long events (up to 1 hour over)
            const midnight = new Date();
            midnight.setHours(0, 0, 0, 0);
            const currentTime = new Date(midnight);

            // Go through every possible 30 minute increment in a day
            while (endCutoff >= keys.length + newTimes.length) {
              newTimes.push(this.formatAMPM(currentTime));
              currentTime.setMinutes(currentTime.getMinutes() + 30);
            }
          }
          break;
        }
      }

      return this.timeWindows.concat(newTimes).slice(startCutoff, endCutoff);
    },
    timezoneDisplayName() {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        // apply some light formatting to the time zone
        return tz.replace('_', ' ');
      }
      // some browsers do not support this (e.g. IE11)
      return '';
    },
    eventIsLive() {
      // Returns if the event us currently happening
      const start = new Date(this.selectedEvent.start_time);
      const end = new Date(this.selectedEvent.end_time);
      const now = new Date();

      return start <= now && now <= end;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.schedule-page {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.schedule-list-title-item {
  background: var(--color-foreground);
  box-sizing: border-box;
  border-radius: var(--border-radius);
  padding: 10px;
  font-style: normal;
  font-weight: 300;
  font-size: 24px;
  margin-right: 3px;
  border: 5px solid rgba(var(--color-primary-rgb), 0.5);
  color: rgba(var(--color-primary-rgb), 0.5);
  cursor: pointer;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.schedule-list-title-item-selected {
  border-color: var(--color-primary);
  box-shadow: 0px 4px 4px rgba(var(--color-primary-rgb), 0.25);
  color: var(--color-primary);
}

.schedule-wrapper {
  margin: 2rem 0;
}

.schedule-body {
  background: var(--color-foreground);
  border-radius: 8px;
  height: fit-content;
  width: 90vw;
  display: flex;
  justify-content: flex-start;
}

.schedule-time {
  display: flex;
  flex-flow: column;
  width: 10%;
}

.schedule-content {
  display: flex;
  width: 90%;
  flex-direction: row;
  flex-wrap: wrap;
}

.timewindow {
  font-size: 1.5rem;
  height: 7.5vh;
  width: 100%;
  border-top: 3px solid var(--color-light-border);
}

.schedule-column {
  width: 25%;
  max-width: 30%;
  flex-wrap: wrap;
}

.schedule-content-item {
  height: 4.5vh;
  border-radius: 8px;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  width: 18.5%;
  font-size: 16px !important;
  cursor: pointer;
  position: absolute;
  padding-top: 0.5rem;
  line-height: 16px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-light-text);
}

.length-30-min,
.length-45-min {
  font-size: 16px !important;
}

.schedule-content-item-star {
  width: fit-content;
  margin-left: 0.5rem;
}

.schedule-content-item-horizons-icon {
  width: fit-content;
}

.schedule-content-item-title {
  flex-grow: 1;
  text-align: start;
  padding-left: 1rem;
  margin-right: 2rem;
  max-width: 80%;
}

.schedule-time-line {
  width: 60vw;
  position: absolute;
  height: 2px;
  margin-left: 1rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.schedule-time-line-inner {
  width: 100%;
  border: 1px solid rgba(var(--color-primary-rgb), 0.8);
}

.schedule-time-line-header {
  border-radius: 50%;
  padding: 8px;
  background-color: rgba(var(--color-primary-rgb), 0.8);
  border: 1px solid rgba(var(--color-primary-rgb), 0.8);
}

.event-passed {
  opacity: 0.5;
}

.length-30-min {
  height: 7vh !important;
}

.length-45-min {
  height: 11.5vh !important;
}

.length-60-min {
  height: 14.5vh !important;
}

.length-75-min {
  height: 11vh !important;
}

.length-90-min {
  height: 22vh !important;
}

.length-120-min {
  height: 29.5vh !important;
}

.length-150-min {
  height: 34.5vh !important;
}

.length-180-min {
  height: 44.5vh !important;
}

.schedule-content-item-title {
  padding-left: 0.5rem;
  margin-right: 0.5rem;
}

/* Coloring by Category */
.main-event-text {
  color: var(--color-main-event);
}

.workshop-text {
  color: var(--color-workshop);
}

.food-text {
  color: var(--color-food);
}

.mini-event-text {
  color: var(--color-mini-event);
}

.demo-text {
  color: var(--color-demo);
}

/* border-color: darken(background-color, 25%) */
.main-event {
  background-color: var(--color-main-event);
  border-color: var(--color-main-event-border);
}

.mini-event {
  background-color: var(--color-mini-event);
  border-color: var(--color-mini-event-border);
}

.demo-event {
  background-color: var(--color-demo);
  border-color: var(--color-demo-border);
}

.workshop-event {
  background-color: var(--color-workshop);
  border-color: var(--color-workshop-border);
}

.food-event {
  background-color: var(--color-food);
  border-color: var(--color-food-border);
}
</style>
