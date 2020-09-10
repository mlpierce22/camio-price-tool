<!----------------- BEGIN JS/TS ----------------->
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
@Component({
  components: {}
})
export default class VBackNextButton extends Vue {
  // TODO: add correct formatting here.
  @Prop() next!: string;

  @Prop() back!: string;

  constructor() {
    super();
  }
}
</script>

<!----------------- BEGIN HTML ----------------->
<template lang="html">
  <div class="v-back-next-button">
    <v-btn
      class="back-button"
      color="secondary"
      text
      v-if="back"
      @click="$emit('back-click')"
    >
      <v-icon>mdi-arrow-left</v-icon> {{ back }}
    </v-btn>
    <v-btn
      class="next-button"
      dark
      depressed
      color="secondary"
      v-if="next"
      @click="$emit('next-click')"
    >
      {{ next }} <v-icon>mdi-arrow-right</v-icon>
    </v-btn>
  </div>
</template>

<!----------------- BEGIN CSS/SCSS ----------------->
<style scoped lang="scss">
.v-back-next-button {
  display: flex;
  margin-top: 30px;

  .back-button {
    .v-icon {
      margin-right: 5px;
    }
  }

  .next-button {
    margin-left: auto;

    .v-icon {
      margin-left: 5px;
    }
  }
}
</style>
