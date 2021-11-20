<template>
  <div class="page">
    <h1>Hold On...</h1>
    <p class="important-text"># seconds remaining. You are #th in line</p>
    <p>Please keep this tab open while we connect you with a sponsor.</p>
    <p>Reminder: Here are some things you can talk about with the sponsor:</p>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat.
    </p>
    <router-link v-if="ready" to="/speed-chatting/thanks"><Button class="btn-secondary">Join Meeting</Button></router-link>
    <Button v-else class="btn-secondary" disabled>Not ready yet...</Button>
  </div>
</template>

<script>
import Button from '@/components/Button.vue';
import generalMixin from '../mixins/general';

export default {
  name: 'Speed Chatting Queue',
  mixins: [generalMixin],
  components: {
    Button,
  },
};
</script>

<style scoped>
.page {
  margin: 5% 10%;
}

.important-text {
  font-size: 24pt;
}
</style>
