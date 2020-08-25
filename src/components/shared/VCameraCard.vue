<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { CamResolution } from "@/models";
@Component({
  components: {}
})
export default class VCameraCard extends Vue {
  // ---------- Props ----------
  @Prop() camera!: CamResolution;
  // ------- Local Vars --------
  camCount = 1;

  cameraTitle = "";
  //TODO: add output events and find the source of the error that camera title is undefined
  //TODO: create plan
  // TODO: styling

  rules = {
    empty: value => !!value || "Required.",
    min: value => value >= 1 || "Must have at least one."
  };
  // --------- Watchers --------
  constructor() {
    // ------- Lifecycle ---------
    super();
    this.camCount = this.camera.numCameras;
    this.cameraTitle = this.camera.title;
  }
  // --------- Methods ---------
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="v-camera-card">
    <div class="resolution">
      <v-select
        :items="camera.cameraOpts"
        v-model="cameraTitle"
        label="Resolution"
        hide-details
        outlined
      ></v-select>
    </div>
    <div class="num-streams">
      <div class="title">
        # of Streams
      </div>
      <v-text-field
        class="text-box"
        v-model="camCount"
        type="number"
        background-color="#CBE3C4"
        color="#50B536"
        min="1"
        step="1"
        :validate-on-blur="true"
        :rules="[rules.empty, rules.min]"
      ></v-text-field>
    </div>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.v-camera-card {
}
</style>
<!----------------- END CSS/SCSS ------------------>
