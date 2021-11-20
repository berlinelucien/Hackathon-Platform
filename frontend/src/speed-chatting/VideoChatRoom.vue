<template>
 <div>
    <h2 class="page-header">Welcome to Sponsor Speed Chatting!</h2>
    <div class="row">
      <div class="col">
        <div>
          <Video :username=username
                :room_name=room_name />
        </div>
      </div>
      <div class="col">
        <div class="body-container">
        PLACEHOLDER FOR SPONSOR

        AND HACKER INFORMATION
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Video from '@/components/Video.vue';
import generalMixin from '../mixins/general';

// TODO: Change room_name to different values when sponsors need
// TODO: Remove random generation of usernames
export default {
  name: 'SpeedChatting',
  data() {
    return {
      username: this.rndStr(5),
      room_name: 'TEST',
    };
  },
  mixins: [generalMixin],
  components: {
    Video,
  },
  methods: {
    rndStr(len) {
      let text = '';
      const chars = 'abcdefghijklmnopqrstuvwxyz';

      for (let i = 0; i < len; i += 1) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      return text;
    },
  },
};
</script>

<style scoped>
p{
  text-align: left !important;
}

h4,
h5,
h6{
  text-align: left !important;
  padding-bottom: 1rem;
}

.btn{
  margin-top: 4rem;
  background-color: var(--lavender);
  border-color: var(--lavender)
}

.btn:hover,
.btn:focus,
.btn:active {
  background-color: var(--light-lavender) !important;
  border-color: var(--light-lavender) !important;
}

.page-container {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding-top: 2rem;
  padding-bottom: 2rem;
}
.body-container {
  background: var(--light-lavender);
  height: fit-content;
  padding-top: 2rem;
  padding-left: 3rem;
  padding-right: 3rem;
  padding-bottom: 2rem;
}

</style>
