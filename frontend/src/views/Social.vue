<template>
    <div>
        <div class="slack-button">
          <Button @click=getSlackLink()>Join the Slack Group!</Button>
        </div>
        <div id="social-page">
          <b-card class="games">
            <div class="column-card">
              <h4 class="games-section-title">Games</h4>
              <b-container>
                <div>
                  <SectionTitle title="Mini Games" />
                  <div class="game-container">
                    <router-link :to="'/schedule?event=' + eventIds.miniGames1">
                      <div class="game-card">
                          Session #1
                      </div>
                    </router-link>
                    <router-link :to="'/schedule?event=' + eventIds.miniGames2">
                      <div class="game-card">
                          Session #2
                      </div>
                    </router-link>
                  </div>
                </div>
                <div>
                  <SectionTitle title="Minecraft" />
                  <div class="game-container">
                    <router-link :to="'/schedule?event=' + eventIds.minecraft1">
                      <div class="game-card">
                          Minecraft Free Build
                      </div>
                    </router-link>
                  </div>
                </div>
                <div>
                  <SectionTitle title="Trivia" />
                  <div class="game-container">
                    <router-link :to="'/schedule?event=' + eventIds.Trivia1">
                      <div class="game-card">
                          Trivia Session
                      </div>
                    </router-link>
                  </div>
                </div>
              </b-container>
            </div>
          </b-card>
          <div id="watercooler-side">
            <b-card class="watercooler">
              <div class="column-card">
                <h4 class="section-title">Networking: Virtual Water Cooler</h4>
                <div class="filler"></div>
                <p class="cooler-text">The water cooler is a room where you will be paired up with other hackers
                    to meet, network, and interact. Once you join the room, you will be paired with
                    other hackers by Technica organizers in a breakout room for 10 minutes at a time.
                </p>
                <p class="cooler-text">Click the link below to join and meet other people!</p>
                <div>
                  <ZoomButton :href="waterCoolerLink">Join the Cooler</ZoomButton>
                </div>
              </div>
            </b-card>
            <b-card class="watercooler-image">
              <div class="column-card">
                <h4 class="section-title">*Insert Watercooler Illustration*</h4>
              </div>
            </b-card>
              <EasterEgg
                :index=1
                :hint="'You found me! If you want to take a break before continuing, join the watercooler groups! If you’re ready, here is your next Techniclue: translate the following hexadecimal into UTF-8 to know where the next character is: 73 70 6f 6e 73 6f 72 73 68 69 70.'"
                :fileName="'scavenger-hunt/2.png'"
              />
          </div>
        </div>
    </div>
</template>

<script>
import Button from '@/components/Button.vue';
import ZoomButton from '@/components/ZoomButton.vue';
import EasterEgg from '@/components/EasterEgg.vue';
import SectionTitle from '../components/SectionTitle';
import generalMixin from '../mixins/general';
import Config from '../config/general';

export default {
  name: 'Social',
  components: {
    Button,
    ZoomButton,
    SectionTitle,
    EasterEgg,
  },
  mixins: [generalMixin],
  methods: {
    getSlackLink() {
      window.open(Config.shared.SLACK_INVITE_LINK, '_blank');
    },
  },
  computed: {
    waterCoolerLink() {
      return this.getEnvVariable('WATER_COOLER_ZOOM_LINK');
    },
    eventIds() {
      return this.getEnvVariable('eventIds');
    },
  },
};
</script>

<style scoped>

#social-page {
  /* Screen size minus approx navbar height */
  box-sizing: border-box;
  width: 100%;
  padding: 2rem 5rem;
  display: grid;
  gap: 4rem;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: max-content 340px 340px;
  grid-template-areas:
    "games watercooler";
  place-items: stretch;
}

#watercooler-side {
  display: grid;
  row-gap: 2rem;
  text-align: center;
  grid-template-rows: 340px 340px;
}

.filler {
  margin: 1rem;
}

.section-container {
  width: 80%;
  height: fit-content;
}

.game-container {
  margin: 1rem;
  display: flex;
  justify-content: space-around;
  margin-bottom: 2rem;
}

.game-card {
  background: var(--color-border);
  color: black;
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 1rem;;
}

/* .game-card img {
  height: 80px;
  margin: 0.5rem;
  margin-right: 1rem;
} */

p.cooler-text{
  margin-left: 2rem !important;
  margin-right: 2rem !important;
  font-size: medium;
  word-wrap: break-word;
}

h3.section-title{
  margin-bottom: 2rem;
}

.btn{
  margin-top:1.5rem !important;
}

.column-card {
  display: flex !important;
  height: 100%;
  flex-direction: column;
  min-height: 0;
}

h4.games-section-title {
  margin: 2rem;
}

::v-deep .card-body {
  display: flex;
  flex-direction: column;
}
</style>
