<template>
  <div id="app">
    <navbar
      v-if="!['Event'].includes($route.name)"
      :displayRouteList="displayRouteList"
      :userIsMemberOfTeam="userIsMemberOfTeam"
    />
    <router-view @teamMembershipChanged="teamMembershipChanged" />
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import Vue from 'vue';
import Navbar from '@/components/Navbar.vue';
import generalMixin from '@/mixins/general.js';

const routesWithoutNavBar = ['Login', 'Register', 'Authenticate'];

export default {
  name: 'App',
  components: {
    Navbar,
  },
  computed: {
    displayRouteList() {
      return !routesWithoutNavBar.includes(this.$route.name);
    },
  },
  async mounted() {
    while (!this.$route.name) {
      // eslint-disable-next-line no-await-in-loop
      await this.sleep(50);
    }
    this.userIsMemberOfTeam = await this.checkIfUserHasTeam();
  },
  data() {
    return {
      userIsMemberOfTeam: false,
    };
  },
  mixins: [generalMixin],
  methods: {
    teamMembershipChanged(change) {
      this.userIsMemberOfTeam = change;
    },
  },
};
</script>
