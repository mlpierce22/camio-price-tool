<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { CamResolution } from "@/models";
import { filter } from "vue/types/umd";
@Component({
  components: {}
})
export default class VCameraCard extends Vue {
  // ---------- Props ----------
  @Prop() camera!: CamResolution;

  @Prop() isDeletable!: boolean;

  @Prop() selected!: string[];

  @Prop() disabled!: boolean;
  // ------- Local Vars --------
  camCount = 1;

  cameraTitle = "";
  // TODO: styling

  rules = {
    empty: value => !!value || "Required.",
    min: value => value >= 1 || "Must have at least one."
  };
  // --------- Watchers --------

  @Watch("camCount")
  moreCams() {
    this.$emit("update", {
      field: "numCameras",
      payload: this.camCountAsNumber
    });
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

  get usableResolutions() {
    const filtered = this.camera.cameraOpts.filter(option => {
      return !this.selected.includes(option);
    });
    filtered.push(this.cameraTitle);
    filtered
      .sort((a, b) => {
        const first = +a.split(" ")[0];
        const second = +b.split(" ")[0];
        return first - second;
      })
      .filter(val => val !== "");
    console.log("filtered", filtered);
    return filtered;
  }

  get camCountAsNumber() {
    return parseInt(this.camCount as any);
  }
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="v-camera-card">
    <div class="dropdown-icon">
      <v-icon class="icon" color="secondary" size="60"
        >mdi-video-outline</v-icon
      >
      <div class="resolution">
        <v-select
          :items="usableResolutions"
          v-model="cameraTitle"
          label="Resolution"
          hide-details
          outlined
          :disabled="disabled"
        ></v-select>
      </div>
    </div>
    <div class="streams-icon">
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
      <v-btn
        icon
        color="error"
        :disabled="!isDeletable"
        @click="$emit('delete')"
        class="delete"
      >
        <v-icon>mdi-trash-can</v-icon>
      </v-btn>
    </div>
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
  .dropdown-icon {
    display: flex;

    .resolution {
      padding: 0px 10px;
    }
  }
  .streams-icon {
    display: flex;
    align-items: center;

    .num-streams {
      display: flex;
      flex-direction: column;
      width: 150px;

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
    }
  }
  @media only screen and (max-width: 630px) {
    flex-direction: column;

    .streams-icon {
      .delete {
        margin-left: 10px;
      }
    }
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
