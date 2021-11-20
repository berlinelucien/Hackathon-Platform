<template>
  <div>
    <h2 class="page-header">Welcome to Sponsor Speed Dating!</h2>
    <div
      id="help-body"
      class="container my-3 my-md-5"
    >
        <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <p>
            When you’re ready, click below to save the event to your calendar or enter the queue!
        </p>
        <router-link to="/speed-chatting/lobby"><Button>Start Chatting!</Button></router-link>
    </div>
    <div class="page-container">
      <h4>Frequently Asked Questions</h4>
      <div class="body-container">
          <div class="row">
            <div
              v-for="(items, i) in [leftPanelItems, rightPanelItems]"
              class="col-md"
              :key="i"
            >
              <div v-if="i===0">
                <h5><b>Hackers:</b></h5>
              </div>
              <div v-else>
                <h5><b>Sponsors:</b></h5>
              </div>
              <div
                v-for="item in items"
                :key="item.title"
              >
              <h6> {{item.title}} </h6>
              </div>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import Button from '@/components/Button.vue';
import generalMixin from '../mixins/general';
import Content from '../config/content';

export default {
  name: 'SpeedChatting',
  mixins: [generalMixin],
  components: {
    Button,
  },
  computed: {
    rightPanelItems() {
      return Content.SpeedChattingResources.rightPanelItems;
    },
    leftPanelItems() {
      return Content.SpeedChattingResources.leftPanelItems;
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
  border-color: var(--lavender);
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
  align-content: left;
  background: var(--light-lavender);
  border: 1px solid var(--light-lavender);
  box-sizing: border-box;
  border-radius: 20px;
  height: fit-content;
  min-width: 70vw;
  width: 70%;
  padding-top: 2rem;
  padding-left: 3rem;
  padding-right: 3rem;
  padding-bottom: 2rem;
}

</style>
