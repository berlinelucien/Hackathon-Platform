<template>
  <b-container class="passport-container">
    <h2 class="page-header">My Achievements</h2>
    <p class="mb-5">
      Your Achievements page helps you keep track of the different events you've
      attended during the event. By participating in mini games, attending workshops,
      or speaking to our sponsors, you can earn points for your Campfire Team. See if you can earn
      all 6 badges by the end of the event!
    </p>
    <!-- <p>
      1 workshop: Access to spotify playlist
      <span v-if="totalAttended > 0"><a
          href="https://open.spotify.com/playlist/5xif4sULGuWiZDVCcjNXxR?si=9uq8TrP6SQOeFUEaEmFckw"
          target="_blank"
        >(Click here for link)</a></span>
    </p>
    <p>
      3 workshops: Downloadable coloring page
      <span v-if="totalAttended > 2"><a
          href="https://www.notion.so/Downloadable-Coloring-Pages-f47b9aaf19b440ccb2446a3708ba8241"
          target="_blank"
        >(Click here for link)</a></span>
    </p>
    <p>
      5 workshops: Exclusive Physical Swag
      <span v-if="totalAttended > 4"><b>Completed!</b></span>
    </p>
    <p>
      Hidden virtual swag: look around the platform for postage stamps to claim
      your prize!
    </p> -->
    <div
      class="display-container"
      v-if="activityLoaded"
    >
      <div class="passport-wrapper">
        <div class="left-panel-inner">
          <div class="attendance-title">
            <img
              :src="getProfileImageForUser({ id: getUserId()})"
              class="member-list-photo"
            />
            <b class="passport-title-bold">{{ getUserName() }}</b>
          </div>
          <div class="events-title-wrapper">
            <p><strong>Total Points:</strong> {{userPoints}}</p>
          </div>
          <div class="dot-wrapper">
            <div
              class="achievement"
              v-for="{id, achievement_name, points} in achievements"
              :key="id"
            >
              <p class="achievement-text">{{ achievement_name }}</p>
              <span class="achievement-points text-muted">+{{ points }} points</span>
            </div>
          </div>
        </div>
        <div
          class="d-flex flex-column"
          style="width: 50%; height: 100%"
        >
          <div class="my-3">
            <strong class="passport-title-bold">Badges</strong>
          </div>
          <div class="sticker-container">
            <AchievementSticker
              :active="countAchievementsOfType('event-workshop-event') >= 1"
              :imgSrc="require('@/assets/stickers/compass.svg')"
              description="Attended 1 Workshop"
            />
            <AchievementSticker
              :active="countAchievementsOfType('event-mini-event') >= 1"
              :imgSrc="require('@/assets/stickers/tent.svg')"
              description="Attended 1 Mini Event"
            />
            <AchievementSticker
              :active="userDidFillOutProfile"
              :imgSrc="require('@/assets/stickers/sign.svg')"
              description="Completed Your Hacker Profile"
            />
            <AchievementSticker
              :active="countAchievementsOfType('sponsor-zoom') >= 1"
              :imgSrc="require('@/assets/stickers/binoculars.svg')"
              description="Joined a Sponsor's Zoom Session"
            />
            <AchievementSticker
              :active="countAchievementsOfType('view-sponsor-booth') >= 5"
              :imgSrc="require('@/assets/stickers/map.svg')"
              description="Viewed 5 Sponsor Booths"
            />
            <AchievementSticker
              :active="countAchievementsOfType('event-workshop-event') >= 3"
              :imgSrc="require('@/assets/stickers/leaf.svg')"
              description="Attended 3 Workshops"
            />
          </div>
        </div>
      </div>
    </div>
    <LoadingSpinner v-else />
  </b-container>
</template>

<script>
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import generalMixin from '../mixins/general';
import usersMixin from '../mixins/users';
import AchievementSticker from '../components/AchievementSticker.vue';

export default {
  name: 'Passport',
  components: {
    LoadingSpinner,
    AchievementSticker,
  },
  mixins: [generalMixin, usersMixin],
  data() {
    return {
      activityLoaded: false,
      userDidFillOutProfile: false,
      achievements: [],
      eventsAttended: [],
      userPoints: 0,
    };
  },
  async mounted() {
    const userParams = {
      user_id: this.getUserId(),
    };

    // Fetch a user's points and achievements
    const responses = await Promise.all([
      this.performGetRequest(
        this.getEnvVariable('BACKEND'),
        'get_achievements',
        userParams,
      ),
      this.performGetRequest(
        this.getEnvVariable('BACKEND'),
        'get_user_points',
        userParams,
      ),
      this.checkIfUserDidFillOutProfile(),
    ]);

    // Only process the responses if the requests succeeded
    if (responses.every((response) => response !== null)) {
      [this.achievements, this.userPoints, this.userDidFillOutProfile] = responses;
      // console.log('points', this.userPoints);
      // console.log('achievements', this.achievements);

      // Extract point values from JSON object
      this.userPoints = this.userPoints.points;
    } else {
      console.error('Unable to retrieve points');
    }

    this.activityLoaded = true;
  },
  methods: {
    countAchievementsOfType(type) {
      // Counts the number of achievements of a particular type (e.g., 'workshop')
      const achievementsOfType = this.achievements.filter(
        (achievement) => achievement.type === type,
      );

      return achievementsOfType.length;
    },
    async checkIfUserDidFillOutProfile() {
      // Returns whether the user filled out their profile
      // by fetching it from the schedule

      // Fetch an up-to-date user profile
      const userParams = { id: this.getUserId() };
      const user = await this.performGetRequest(
        this.getEnvVariable('BACKEND'),
        'users',
        userParams,
      );

      // Check if the profile contains all of the requried fields
      const requiredFields = [
        'devpost',
        'github',
        'project_description',
        'profile_text',
        'email',
      ];
      const isFilledOut = user.hacker_profile && requiredFields.every((field) => field in user.hacker_profile);
      return isFilledOut;
    },
  },
  computed: {
    totalAttended() {
      return this.achievements.length;
    },

  },
};
</script>

<style scoped>
.passport-container {
  padding: 30px;
}

.display-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  width: 100%;
}

.passport-wrapper {
  width: 100%;
  height: 80vh;
  display: flex;
  flex-direction: row;
  background: var(--color-foreground);
  box-sizing: border-box;
  border-radius: 35px 35px 35px 35px;
  overflow: hidden;
}

.left-panel-inner {
  width: 50%;
  height: 100%;
  border-right: 2px solid var(--color-light-border);
  display: flex;
  flex-direction: column;
}

.passport-title-bold {
  margin-left: 1rem;
  font-size: 36px;
  line-height: 46px;
}

.member-list-photo {
  border-radius: 4px;
  width: 6rem;
  height: 6rem;
  margin: 3px;
  border: 1px solid var(--color-light-border);
}

.member-list-info {
  margin-top: 1rem;
  margin-bottom: 2rem;
  margin-right: 1rem;
  margin-left: 0.75rem;
}

.attendance-title {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 30%;
  padding-top: 1rem;
  flex: 0;
}

.attendance-text {
  font-weight: bold;
  font-size: 36px;
  line-height: 46px;
  text-align: center;
  flex: 0;
}

.events-title-wrapper {
  width: 100%;
  padding-top: 1rem;
}

.events-title-wrapper p {
  margin-bottom: 0.5rem;
}

.dot-wrapper {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  width: 100%;
  border-top: 2px solid var(--color-light-border);
  overflow-y: auto;
}

@media (max-width: 1500px) {
  .member-list-photo {
    width: 5rem;
    height: 5rem;
  }
}

.achievement {
  text-align: left;
  padding: 0.5rem;
  margin: 0 0.5rem;
}

.achievement:not(:last-child) {
  border-bottom: 2px solid var(--color-light-border);
}

.achievement-text {
  margin-bottom: 0.25rem;
  font-weight: bold;
}

.sticker-container {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-content: space-around;
  align-items: flex-start;
}

.sticker {
  flex-basis: 50%;
  padding: 0;
}
</style>
