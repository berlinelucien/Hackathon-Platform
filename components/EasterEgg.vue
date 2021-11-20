<template>
    <div>
        <div v-if="this.progress >= this.index" @click="viewEasterEgg()" v-b-modal.easterEggModal>
            <img :src="require('../assets/'+this.fileName)" class="stamp-img">
        </div>
        <b-modal id="easterEggModal" :title="modalTitle" size="lg" style="padding-left: 4rem; padding-right: 4rem;">
            <div class="ee-modal-container">
                <p class="my-4" style="padding-left: 4rem; padding-right: 4rem;text-align: center"> {{ this.hint }}</p>
                <p v-if="this.progress == 5"><a href="https://www.notion.so/Postcard-Prize-Pack-76c80c8023f24597a119fb3a5720373e" target="_blank" >Your name has been entered into a raffle for prizes!</a></p>
            </div>
            <template v-slot:modal-footer>
                <Button @click="goBack">
                  Back to page
                </Button>
            </template>
        </b-modal>
    </div>
</template>

<script>
import Button from '@/components/Button.vue';
import Axios from 'axios';
import generalMixin from '../mixins/general';

const jwt = require('jsonwebtoken');

export default {
  name: 'EasterEgg',
  mixins: [generalMixin],
  components: {
    Button,
  },
  props: {
    index: Number,
    hint: String,
    fileName: String,
  },
  data() {
    return {
      progress: this.getProgress(),
    };
  },
  computed: {
    modalTitle() {
      return (this.progress === 5) ? "You've found all the easter eggs! Congratulations!"
        : `You’ve found clue ${this.progress} out of the 5 in the Scavenger Hunt! Keep Going!`;
    },
  },
  methods: {
    // retrieve easter egg progress of user
    async getProgress() {
      const result = await Axios.get(`${this.getEnvVariable('BACKEND')}/admin/easter_eggs`, {
        headers: {
          Authorization: `Bearer ${jwt.sign({ id: this.getUserId() }, 'technica')}`,
        },
      });
      if (!result.data) {
        this.progress = 0;
      } else {
        this.progress = Number(result.data.progress);
      }
    },
    viewModal() {
      this.$bvModal.show('easterEggModal');
    },
    goBack() {
      this.$bvModal.hide('easterEggModal');
    },
    // when stamp is clicked
    viewEasterEgg() {
      if (this.progress === this.index) {
        this.progress += 1;
        Axios.post(`${this.getEnvVariable('BACKEND')}/admin/easter_eggs`, {
          progress: this.progress,
        }, {
          headers: {
            Authorization: `Bearer ${jwt.sign({ id: this.getUserId() }, 'technica')}`,
          },
        });
      }
    },

  },
};
</script>

<style>

.stamp-img {
  width: 100px;
}

.stamp-img:hover {
    filter: drop-shadow(0px 0px 12px rgba(255, 80, 145, 0.7));
    cursor: pointer;
}

.ee-modal-container {
    width: 100%;
    height: 30vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.modal-footer {
    justify-content: center !important;
}

</style>
