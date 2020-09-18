<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { AccountForm, FullFilteredPlan } from "@/models";
import { DefaultMap, PlanHashes } from "@/new-models";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import TheCreatePlansModal from "@/components/TheCreatePlansModal.vue";

@Component({
  components: {
    TheCreatePlansModal
  }
})
export default class TheEditPlanModal extends Vue {
  // ---------- Props ----------
  @Prop() dialogOpen!: boolean;

  @Prop() planData!: Array<AccountForm>;

  @Prop() defaults!: DefaultMap;

  @Prop() isVertical!: boolean;

  @Prop() planId!: number;

  @Prop() plans!: PlanHashes;
  // ------- Local Vars --------

  currentPlanData: FullFilteredPlan[] = [];

  cameraResolutionList = [];

  // --------- Watchers --------

  // ------- Lifecycle ---------
  constructor() {
    super();
    this.planData.forEach(field => {
      this.currentPlanData.push({ ...field });
    });
  }
  // --------- Methods ---------

  dialogClosed(isSubmit) {
    // update the data structure in parent
    if (isSubmit) {
      this.createPlans();
    }
    this.$emit("close-edit");
    this.currentPlanData = [];
  }

  createPlans() {
    // Remove the current plan id because it is wrong.
    this.$emit("delete-plan", this.planId);
    // Then, create a new one
    this.$emit("add-plan", {
      resolutionsToHandle: this.cameraResolutionList,
      plan: this.currentPlanData
    });
    this.cameraResolutionList = [];
  }

  updatePlan(updateInfo) {
    console.log("info, plan", updateInfo, this.currentPlanData);
    this.currentPlanData[updateInfo.index].selected = updateInfo.payload;
  }

  get randomKey() {
    return Math.floor(Math.random() * 1000);
  }

  get title() {
    const titleField = this.planData.find(data => data.fieldName == "title");
    return titleField ? (titleField.selected as string) : "";
  }

  get cameraCount() {
    return this.plans[this.planId].numCameras;
  }
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="the-edit-plan-modal">
    <TheCreatePlansModal
      v-if="planData"
      :key="`editing-${randomKey}-${dialogOpen}`"
      :dialog="dialogOpen"
      :planData="planData"
      :isVertical="isVertical"
      :title="title"
      :defaults="defaults"
      :isEditing="true"
      :existingCameraCount="cameraCount"
      @delete-plan="$emit('delete-plan', planId)"
      @dialog-closed="dialogClosed($event)"
      @changed-form-item="updatePlan($event)"
      @resolution-change="cameraResolutionList = $event"
    />
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.the-edit-plan-modal {
  display: flex;
  flex-direction: column;
}
</style>
<!----------------- END CSS/SCSS ------------------>
