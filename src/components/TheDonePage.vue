<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { ProgressionState, User } from "@/models";
import { Component, Prop, Vue } from "vue-property-decorator";
@Component({
  components: {}
})
export default class TheDonePage extends Vue {
  // ---------- Props ----------
  @Prop() progressionState!: ProgressionState;

  @Prop() user!: User;
  // ------- Local Vars --------

  // --------- Watchers --------

  // ------- Lifecycle ---------
  constructor() {
    super();
  }
  // --------- Methods ---------
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="the-done-page">
    <v-icon class="big-icon" color="secondary">mdi-check-circle-outline</v-icon>
    <div class="secondary--text done-text">You're All Done!</div>
    <div class="text">Thank you for your interest in Camio!</div>
    <div class="text">
      Your official quote was sent to
      <span class="primary--text">{{ user.email }}.</span>
    </div>
    <v-btn
      class="edit"
      @click="$emit('make-changes', progressionState.onStep - 1)"
      depressed
      color="success"
    >
      <v-icon>mdi-pencil</v-icon>
      <div class="btn-text">Edit this quote</div>
    </v-btn>
    <v-btn
      class="restart"
      @click="$emit('start-over')"
      depressed
      color="success"
    >
      <v-icon>mdi-refresh</v-icon>
      <div class="btn-text">Start new quote</div>
    </v-btn>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.the-done-page {
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  align-items: center;

  .big-icon {
    font-size: 228px;
  }

  .done-text {
    font-weight: bold;
    font-size: 50px;
  }

  .text {
    font-size: 30px;
    max-width: 94%;
    text-align: center;
  }

  .v-btn__content {
    display: flex;
    flex-direction: row;

    .btn-text {
      margin-left: 5px;
    }
  }

  .edit {
    margin-top: 21px;
  }

  .restart {
    margin: 21px 0px;
  }

  @media only screen and (max-width: 930px) {
    .text {
      font-size: 20px;
      text-align: center;
    }

    .done-text {
      font-size: 28px;
    }

    .big-icon {
      font-size: 180px;
    }
  }

  @media only screen and (max-width: 650px) {
    .text {
      text-align: center;
      font-size: 17px;
    }
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
