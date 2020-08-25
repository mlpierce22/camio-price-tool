<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import {
  PlanTemplates,
  AccountSubForm,
  AccountForm,
  FullFilteredPlan,
  CamResolution
} from "@/models";
import VBackNextButton from "@/components/shared/VBackNextButton.vue";
import VFormItemPicker from "@/components/shared/VFormItemPicker.vue";
import VCameraCard from "@/components/shared/VCameraCard.vue";

@Component({
  components: {
    VBackNextButton,
    VFormItemPicker,
    VCameraCard
  }
})
export default class TheCreatePlansModal extends Vue {
  // ---------- Props ----------
  @Prop() dialog!: boolean;

  @Prop() planData!: FullFilteredPlan;

  @Prop() isVertical!: boolean;
  // ------- Local Vars --------

  dialogOpen!: boolean;

  multiResoution = false;

  cameraResolutions: Array<CamResolution> = [];

  // --------- Watchers --------
  @Watch("dialogOpen")
  dialogClosed() {
    this.$emit("dialog-closed");
  }

  @Watch("dialog")
  dialogChange($event) {
    if ($event) {
      this.dialogOpen = this.dialog;
    }
  }

  constructor() {
    // ------- Lifecycle ---------
    super();
    this.dialogOpen = this.dialog;
  }
  // --------- Methods ---------
  changedForm(index, fieldChanged, event) {
    this.$emit("changed-form-item", { index, fieldChanged, payload: event });
  }

  get resolutions() {
    const defaultCamera = this.planData.selected as string;
    if (
      this.cameraResolutions.filter(
        resolution => resolution.title == defaultCamera
      ).length == 0
    ) {
      this.cameraResolutions.push({
        title: defaultCamera,
        numCameras: 1,
        cameraOpts: this.planData.selectionOpts as string[]
      });
    }
    return this.cameraResolutions;
  }

  addResolution() {
    this.cameraResolutions.push({
      title: "",
      numCameras: 1,
      cameraOpts: this.planData.selectionOpts as string[]
    });
  }

  removeResolution(indexToRemove) {
    this.cameraResolutions.splice(indexToRemove, 1);
  }

  updateResolution(indexToUpdate, payload) {
    this.cameraResolutions[indexToUpdate] = payload;
  }

  submit() {
    this.$emit("dialog-closed", true);
  }
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="the-create-plans-modal">
    <v-dialog
      v-model="dialogOpen"
      :fullscreen="isVertical"
      persistent
      max-width="1200"
    >
      <v-card class="modal">
        <div
          v-for="(planItem, index) in planData"
          :key="`${index}-form-item`"
          class="form-item"
        >
          <div
            class="top-form"
            v-if="planItem.fieldName !== 'resolution'"
            key="notResolution"
          >
            <VFormItemPicker
              :data="planItem"
              @selected-changed="changedForm(index, planItem.fieldName, $event)"
            />
          </div>
          <div class="bottom-form" v-else key="resolution">
            <div class="title">
              Subscribe Cameras
            </div>
            <div class="camera-card-container">
              <VCameraCard :camera="resolutions[0]" />
              <v-checkbox
                v-model="multiResoution"
                label="I need to subscribe more than one camera resolution to this plan."
              ></v-checkbox>
              <div class="sub-container">
                <div class="warning-box">
                  Every extra camera you add will generate a duplicate plan at
                  that resolution in the form “plan-name resolution”. (e.g.
                  Social Distancing 3MP)
                </div>
                <div
                  class="cameras"
                  v-for="(camera, index) in resolutions"
                  :key="`camera-${index}`"
                >
                  <VCameraCard
                    :camera="camera"
                    @delete="removeResolution"
                    @update="updateResolution"
                    v-if="index > 0 && multiResoution"
                  />
                </div>
                <v-btn @click="addResolution" color="secondary"
                  >Add Camera Type</v-btn
                >
              </div>
            </div>
          </div>
        </div>

        <VBackNextButton
          @next-click="submit()"
          @back-click="dialogOpen = false"
          next="Create Plan"
          back="Cancel"
        />
      </v-card>
    </v-dialog>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.the-create-plans-modal {
}
</style>
<!----------------- END CSS/SCSS ------------------>
