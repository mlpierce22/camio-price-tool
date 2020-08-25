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

  @Prop() isDeletable!: boolean;
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

  @Watch("camCount")
  moreCams() {
    this.$emit("update", { field: "numCameras", payload: this.camCount });
  }

  @Watch("cameraTitle")
  newSelection() {
    this.$emit("update", { field: "title", payload: this.cameraTitle });
  }

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
    <v-icon class="icon" color="secondary" size="60">mdi-video-outline</v-icon>
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
        outlined
        :hide-details="true"
        :validate-on-blur="true"
        :rules="[rules.empty, rules.min]"
      ></v-text-field>
    </div>
    <v-btn icon color="error" :disabled="!isDeletable" @click="$emit('delete')">
      <v-icon>mdi-trash-can</v-icon>
    </v-btn>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.v-camera-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 650px;
  background: rgba(203, 227, 196, 0.22);
  border: 3px solid #50b536;
  border-radius: 10px;
  padding: 10px 20px;

  @media only screen and (max-width: 450px) {
    .icon {
      display: none;
    }
  }
  .resolution {
    padding: 0px 10px;
  }

  .num-streams {
    display: flex;
    flex-direction: column;
    max-width: 119px;

    @media only screen and (max-width: 450px) {
      .title {
        font-size: 1.1rem !important;
      }
    }

    ::v-deep.text-box {
      .v-input__slot {
        border-radius: 10px;
        min-height: 0px;

        input {
          text-align: center;
          padding: 8px 0px 8px 13px;

          @media only screen and (max-width: 450px) {
            padding: 8px 0px 8px 0px;
          }
        }
      }
    }

    // ::v-deep .text-box input {
    //   text-align: center;
    // }
    // ::v-deep .v-text-field input {
    //   padding: 8px 0px 8px 13px;
    // }

    // ::v-deep .text-box .v-input__slot {
    //   border-top-right-radius: 10px;
    //   border-top-left-radius: 10px;
    // }
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
