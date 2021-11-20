<template>
  <div class="page">
    <h3 class="title">You finished the call</h3>
    <router-link to="/speed-chatting"><Button class="btn-secondary">Back to the speed dating home page</Button></router-link>
  </div>
</template>

<script>
import Button from '@/components/Button.vue';
import generalMixin from '../mixins/general';

export default {
  name: 'Speed Chatting End',
  mixins: [generalMixin],
  components: {
    Button,
  },
};
</script>

<style scoped>
.page {
  margin: 10%;
}

.title {
  color: var(--color-secondary);
}
</style>
