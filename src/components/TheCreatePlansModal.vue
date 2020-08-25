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

  resolutions(planItem) {
    const defaultCamera = planItem.selected as string;
    console.log("the planData", planItem);
    if (
      this.cameraResolutions.filter(
        resolution => resolution.title == defaultCamera
      ).length == 0
    ) {
      console.log("pushed");
      this.cameraResolutions.push({
        title: defaultCamera,
        numCameras: 1,
        cameraOpts: [...(planItem.selectionOpts as string[])]
      });
    }
    return this.cameraResolutions;
  }

  addResolution(planItem) {
    this.cameraResolutions.push({
      title: "",
      numCameras: 1,
      cameraOpts: [...(planItem.selectionOpts as string[])]
    });
  }

  removeResolution(indexToRemove) {
    this.cameraResolutions.splice(indexToRemove, 1);
  }

  updateResolution(indexToUpdate, payload) {
    this.cameraResolutions[indexToUpdate][payload.field] = payload.payload;
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
      content-class="dialog-content"
      :fullscreen="isVertical"
      :attach="$el"
      persistent
      max-width="1200"
    >
      <v-card class="modal">
        <div class="wrapper">
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
                @selected-changed="
                  changedForm(index, planItem.fieldName, $event)
                "
              />
            </div>
            <div class="bottom-form" v-else key="resolution">
              <div class="title-container">
                <v-icon class="icon" color="primary" size="60"
                  >mdi-video-outline</v-icon
                >
                <div class="form-title" color="primary">
                  Subscribe Cameras
                </div>
              </div>
              <div class="camera-card-container">
                <VCameraCard
                  key="top-card"
                  :camera="resolutions(planItem)[0]"
                  :isDeletable="false"
                  @update="updateResolution(0, $event)"
                />
                <v-checkbox
                  class="checkbox"
                  v-model="multiResoution"
                  :hide-details="true"
                  label="I need to subscribe more than one camera resolution to this plan."
                ></v-checkbox>
                <div class="sub-container" v-if="multiResoution">
                  <div class="warning-box">
                    Every extra camera you add will generate a duplicate plan at
                    that resolution in the form “plan-name resolution”. (e.g.
                    Social Distancing 3MP)
                  </div>
                  <div
                    class="cameras"
                    v-for="(camera, index) in resolutions(planItem)"
                    :key="`camera-${index}`"
                  >
                    <VCameraCard
                      :camera="camera"
                      :isDeletable="index > 1"
                      @delete="removeResolution(index)"
                      @update="updateResolution(index, $event)"
                      v-if="index > 0"
                    />
                  </div>
                  <v-btn @click="addResolution(planItem)" color="secondary"
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
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.the-create-plans-modal {
  display: flex;
  flex-direction: column;

  ::v-deep .dialog-content {
    .modal {
      padding: 20px;

      .wrapper {
        border: 3px solid #f7931e;
        border-radius: 20px;
        padding: 20px;

        .form-item {
          margin-top: 41px;
          max-width: 80%;
        }

        .bottom-form {
          display: flex;
          flex-direction: column;

          .title-container {
            display: flex;
            margin-bottom: 20px;

            .icon {
            }
            .form-title {
              font-size: 50px;
              font-weight: bold;
              color: #f7931e;
              margin-left: 20px;
            }
          }
          .camera-card-container {
            display: flex;
            flex-direction: column;

            .checkbox {
              background-color: white;
              //line-height: 20px;
              z-index: 1;
              max-width: 500px;

              .v-label {
                color: #222222 !important;
              }
            }

            .sub-container {
              border: 3px solid #50b536;
              border-radius: 10px;
              padding: 30px 20px 20px;
              margin-top: -15px;
              margin-left: 9px;
              display: flex;
              flex-direction: column;
              align-items: center;

              .warning-box {
                background: #fcf8e3;
                border: 1px solid #f7931e;
                border-radius: 10px;
                color: #71592f;
                padding: 5px;
                margin-bottom: 5px;
              }

              .cameras {
                align-self: flex-start;
                margin-top: 5px;
                margin-bottom: 5px;
                width: 100%;
              }
            }
          }
        }
      }
    }
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
