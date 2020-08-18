<!----------------- BEGIN JS/TS ----------------->
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
@Component({
  components: {}
})
export default class VBackNextButton extends Vue {
  @Prop()
  next!: string;

  @Prop()
  back!: string;

  constructor() {
    super();
  }
}
</script>

<!----------------- BEGIN HTML ----------------->
<template lang="html">
  <div class="v-back-next-button">
    <v-btn class="back-button" v-if="back" @click="$emit('back-click')">
      {{ back }}
    </v-btn>
    <v-btn class="next-button" v-if="next" @click="$emit('next-click')">
      {{ next }}
    </v-btn>
  </div>
</template>

<!----------------- BEGIN CSS/SCSS ----------------->
<style scoped lang="scss">
.v-back-next-button {
}
</style>
