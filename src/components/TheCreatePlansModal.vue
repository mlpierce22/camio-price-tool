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
import { DefaultMap } from "@/new-models";

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

  @Prop() title!: string;

  @Prop() defaults!: DefaultMap;

  @Prop() isEditing!: boolean;

  // Note: this only exists if is editing
  @Prop() existingCameraCount!: number;
  // ------- Local Vars --------

  dialogOpen = false;

  multiResolution = false;

  cameraResolutions: Array<CamResolution> = [];

  selectedResolutions: string[] = [];

  selectionOps!: string[];

  expandDelete = false;

  // --------- Watchers --------
  @Watch("dialogOpen")
  dialogClosed($event) {
    if (!$event) {
      this.$emit("dialog-closed", false);
    }
  }

  @Watch("dialog")
  dialogChange() {
    this.dialogOpen = this.dialog;
  }

  @Watch("multiResolution")
  multiStatusChange($event) {
    this.$emit("multi-resolution", $event);
    if ($event) {
      this.addResolution();
    } else {
      // reset camera resolutions
      this.selectedResolutions = [this.selectedResolutions[0]];
      this.cameraResolutions = [this.cameraResolutions[0]];
    }
  }

  @Watch("cameraResolutions", { deep: true })
  resolutionListChange() {
    this.$emit("resolution-change", this.cameraResolutions);
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

  get addOnDefaults() {
    return this.defaults["addOns"] ? this.defaults["addOns"] : undefined;
  }

  resolutions(planItem) {
    const defaultCamera = planItem.selected as string;
    this.selectionOps = [...(planItem.selectionOpts as string[])];

    if (this.cameraResolutions.length == 0) {
      this.selectedResolutions.push(defaultCamera);
      this.cameraResolutions.push({
        title: defaultCamera,
        numCameras: this.existingCameraCount ? this.existingCameraCount : 1,
        cameraOpts: this.selectionOps
      });
    }
    return this.cameraResolutions;
  }

  addResolution() {
    const titleToAdd = this.selectionOps.filter(option => {
      return !this.selectedResolutions.includes(option);
    })[0];

    this.cameraResolutions.push({
      title: titleToAdd,
      numCameras: 1,
      cameraOpts: this.selectionOps
    });
    this.selectedResolutions.push(titleToAdd);
  }

  get resolutionIsDefault() {
    return this.defaults["resolution"] ? true : false;
  }

  removeResolution(indexToRemove) {
    this.cameraResolutions.splice(indexToRemove, 1);
    this.selectedResolutions.splice(indexToRemove, 1);
  }

  updateResolution(indexToUpdate, payload) {
    this.cameraResolutions[indexToUpdate][payload.field] = payload.payload;
    if (
      payload.field == "title" &&
      !this.selectedResolutions.includes(payload.payload)
    ) {
      this.selectedResolutions.splice(indexToUpdate, 1, payload.payload);
    }
  }

  submit() {
    this.multiResolution = false;
    this.selectedResolutions = [];
    this.$emit("dialog-closed", true);
  }

  deletePlan() {
    this.$emit("delete-plan");
    this.$emit("dialog-closed");
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
      max-width="900"
    >
      <v-card class="modal">
        <div class="wrapper">
          <div class="plan-title">
            <v-icon color="primary" size="60">mdi-wrench</v-icon>
            {{ isEditing ? "Editing" : "Creating" }} Plan from:
            {{ title }}
          </div>
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
                :defaults="addOnDefaults"
                @selected-changed="
                  changedForm(index, planItem.fieldName, $event)
                "
              />
            </div>
            <div
              class="bottom-form"
              v-if="planItem.fieldName == 'resolution'"
              key="resolution"
            >
              <div class="title-container">
                <v-icon class="icon" color="primary" size="60"
                  >mdi-video-outline</v-icon
                >
                <div class="form-title" color="primary">
                  {{ isEditing ? "Change Camera Count" : "Subscribe Cameras" }}
                </div>
              </div>
              <div class="camera-card-container">
                <VCameraCard
                  key="top-card"
                  :camera="resolutions(planItem)[0]"
                  :selected="selectedResolutions"
                  :isDeletable="false"
                  :disabled="resolutionIsDefault || isEditing"
                  @update="updateResolution(0, $event)"
                />
                <v-checkbox
                  v-if="!resolutionIsDefault && !isEditing"
                  class="checkbox"
                  v-model="multiResolution"
                  :hide-details="true"
                  label="I need to subscribe more than one camera resolution to this plan."
                ></v-checkbox>
                <div class="sub-container" v-if="multiResolution">
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
                      :key="`camera-card-${camera.title}`"
                      :camera="camera"
                      :isDeletable="index > 1"
                      :selected="selectedResolutions"
                      @delete="removeResolution(index)"
                      @update="updateResolution(index, $event)"
                      v-if="index > 0"
                    />
                  </div>
                  <v-btn
                    :disabled="
                      selectionOps.length == selectedResolutions.length
                    "
                    @click="addResolution()"
                    color="secondary"
                    >Add Camera Type</v-btn
                  >
                </div>
              </div>
            </div>
          </div>
          <v-alert
            dense
            outlined
            color="error"
            :class="{ delete: true, clickable: expandDelete == false }"
            @click="expandDelete = true"
            v-if="isEditing"
          >
            <div class="top">
              <div class="delete-text">Delete Plan</div>
              <v-scroll-x-transition>
                <v-btn
                  icon
                  class="close"
                  v-if="expandDelete"
                  color="error"
                  @click.stop="expandDelete = false"
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-scroll-x-transition>
            </div>

            <v-expand-transition>
              <div class="transition-container" v-show="expandDelete">
                <div class="delete-text">Are you sure?</div>
                <v-btn
                  outlined
                  color="error"
                  class="delete"
                  @click.stop="deletePlan()"
                  >Yes, delete</v-btn
                >
              </div>
            </v-expand-transition>
          </v-alert>
          <!-- <v-btn outlined color="error" class="delete" >
          </v-btn> -->

          <VBackNextButton
            @next-click="submit()"
            @back-click="dialogOpen = false"
            :next="isEditing ? 'Save Changes' : 'Create Plan'"
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

        .plan-title {
          font-size: 40px;
          font-weight: bold;
          color: #f7931e;
          display: flex;
          align-items: center;

          i {
            margin-right: 30px;
          }
        }

        .form-item {
          margin-top: 41px;
          max-width: 80%;

          @media only screen and (max-width: 785px) {
            max-width: 100%;
          }
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
              align-self: center;
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

          @media only screen and (max-width: 780px) {
            .title-container {
              margin-left: 10px;

              .form-title {
                font-size: 30px;
              }
            }
          }
        }

        .delete {
          margin: 20px auto;
          width: fit-content;
          cursor: default;

          &.clickable {
            cursor: pointer;
          }

          .v-alert__wrapper .v-alert__content {
            display: flex;
            flex-direction: column;

            .top {
              display: flex;

              .delete-text {
                font-weight: bold;
                align-self: center;
              }

              .close {
                margin-left: 30px;
              }
            }

            .transition-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              margin-top: 5px;

              .delete {
                margin: 0px;
                cursor: pointer;
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
