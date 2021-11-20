<template>
  <div class="page-container">
    <h2 class="page-header mb-0">Hacker Profiles</h2>
    <p class="mb-5">Click on a hacker's card to view their profile!</p>
    <b-container v-if="dataLoaded">
      <div class="mb-3">
        <label
          class="mr-2"
          for="hacker-searchbar"
        ><strong>Hacker Search:</strong></label>
        <input
          id="hacker-searchbar"
          type="text"
          placeholder="Enter a name here"
          class="form-control d-inline w-auto"
          @input="filterProfiles"
        />
      </div>
      <div class="profiles-container pb-5">
        <div
          v-for="profile in filteredProfiles"
          class="card hacker-profile-card"
          :key="profile.id"
        >
          <div class="schedule-content-item-star">
            <img
              :src="getFavoriteIconFor(profile)"
              @click.stop="toggleProfileInList(profile)"
              style="width: 19px; height: 18px"
            />
          </div>
          <span style="margin-right: .5rem;">{{ profile.full_name }}</span>
          <router-link :to="`/profile?id=${profile.id}`"><Button size="sm">View Profile</Button></router-link>
        </div>
      </div>
    </b-container>
    <LoadingSpinner v-else />
  </div>
</template>

<script>
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import generalMixin from '../mixins/general';
import Button from '../components/Button.vue';

export default {
  name: 'ViewProfiles',
  mixins: [generalMixin],
  components: {
    Button,
    LoadingSpinner,
  },
  data() {
    return {
      profiles: [],
      filteredProfiles: [],
      dataLoaded: false,
    };
  },
  async mounted() {
    const profiles = await this.performGetRequest(this.getEnvVariable('BACKEND'), 'users/list', {});
    this.profiles = profiles.Items
      .filter((profile) => Object.prototype.hasOwnProperty.call(profile, 'full_name'))
      .sort(this.compareProfilesAlphabetically);

    // Create a set of favorite profile ids
    const params = { sponsor_id: this.getUserId() };
    const resp = await this.performGetRequest(this.getEnvVariable('BACKEND'), 'projects/favorite_hacker', params);
    const ids = resp.map((favoritedUser) => favoritedUser.user_id);
    const favoriteProfileIds = new Set(ids);

    // Add a field on the profiles to indicate if they're favorited
    this.profiles = this.profiles.map((profile) => ({
      ...profile,
      isFavorited: favoriteProfileIds.has(profile.id),
    }));

    this.filteredProfiles = this.profiles;
    this.sortByFavorites();
    this.dataLoaded = true;
  },
  methods: {
    filterProfiles(event) {
      const query = event.target.value.toLowerCase();
      this.filteredProfiles = this.profiles.filter((profile) => profile.full_name.toLowerCase().includes(query));
    },
    async toggleProfileInList(targetProfile) {
      // Flip target's isFavorited state instantly
      // eslint-disable-next-line no-param-reassign
      targetProfile.isFavorited = !targetProfile.isFavorited;

      const params = {
        sponsor_id: this.getUserId(),
        user_id: targetProfile.id,
      };

      const route = targetProfile.isFavorited ? 'projects/favorite_hacker' : 'projects/favorite_hacker/delete';
      const response = await this.performPostRequest(this.getEnvVariable('BACKEND'), route, params);
      console.log(response);

      if (response !== null) {
        // Flip star type on success
        this.$forceUpdate();
      } else {
        // Otherwise, roll back the changes
        // eslint-disable-next-line no-param-reassign
        targetProfile.isFavorited = !targetProfile.isFavorited;
      }
    },
    sortByFavorites() {
      // Sort filteredProfiles to put favorited hackers first
      // then sort alphabetically

      this.filteredProfiles
        .sort((profile1, profile2) => {
          if (profile1.isFavorited === profile2.isFavorited) {
            return this.compareProfilesAlphabetically(profile1, profile2);
          }
          if (profile1.isFavorited) {
            return -1;
          }
          return 1;
        });
    },
    compareProfilesAlphabetically(profile1, profile2) {
      return profile1.full_name.localeCompare(profile2.full_name);
    },
    getFavoriteIconFor(profile) {
      const images = require.context('../assets', false, /\.svg|png$/);
      // TODO change to technica colors
      return images(`./${(profile.isFavorited ? 'star_orange_filled.svg' : 'star_orange_empty.svg')}`);
    },
  },
};
</script>

<style scoped>
.profiles-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-direction: row;
  flex-wrap: wrap;
}

.card.hacker-profile-card {
  width: 30%;
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 2px 2px var(--color-shadow);
  margin: 0.5rem;
  padding: 0.5rem;
}

.schedule-content-item-star {
  position: absolute;
  top: 0rem;
  left: 0.5rem;
}
</style>
