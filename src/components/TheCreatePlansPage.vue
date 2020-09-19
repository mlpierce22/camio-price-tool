<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import {
  PlanTemplates,
  AccountForm,
  Plan,
  FullFilteredPlan,
  ProgressionState
} from "@/models";
import VPlanList from "@/components/shared/VPlanList.vue";
import VPageHeader from "@/components/shared/VPageHeader.vue";
import VPlanCard from "@/components/shared/VPlanCard.vue";
import TheCreatePlansModal from "@/components/TheCreatePlansModal.vue";
import { DefaultMap } from "@/new-models";

@Component({
  components: {
    VPlanList,
    VPlanCard,
    TheCreatePlansModal,
    VPageHeader
  }
})
export default class TheCreatePlansPage extends Vue {
  // ---------- Props ----------
  @Prop() planTemplates!: PlanTemplates;

  @Prop() accountData!: Array<AccountForm>;

  @Prop() defaults!: DefaultMap;

  @Prop() createdPlans!: Plan;

  @Prop() isVertical!: boolean;

  @Prop() progressionState!: ProgressionState;
  // ------- Local Vars --------

  dialogOpen = false;

  currentPlanData: FullFilteredPlan[] = [];

  isMultiResolution = false;

  cameraResolutionList = [];

  selectedPlanTemplate = "Basic";

  // --------- Watchers --------

  @Watch("existsAPlan")
  planCountChange(planExists) {
    if (planExists) {
      this.$emit("plan-advancement-change", {
        stepToChange: this.progressionState.planStepId,
        canAdvance: true
      });
    } else {
      this.$emit("plan-advancement-change", {
        stepToChange: this.progressionState.planStepId,
        canAdvance: false
      });
    }
  }
  // ------- Lifecycle ---------
  // TODO: Replace the constructor with created everywhere
  constructor() {
    super();
  }
  // --------- Methods ---------

  dialogClosed(isSubmit) {
    // update the data structure in parent (probably plans)
    if (isSubmit) {
      this.createPlans();
    }
    this.dialogOpen = false;
    this.currentPlanData = [];
  }

  updateFormType(formType: string): string {
    return formType.replace("yes-no-select", "pure-component");
  }

  createPlans() {
    this.$emit("add-plan", {
      resolutionsToHandle: this.cameraResolutionList,
      plan: this.currentPlanData
    });
    this.cameraResolutionList = [];
    this.isMultiResolution = false;
  }

  updatePlan(updateInfo) {
    console.log("updateInfo", updateInfo);
    (this.currentPlanData as FullFilteredPlan[])[updateInfo.index].selected =
      updateInfo.payload;
  }

  get resolutionIsDefault() {
    return this.defaults["resolution"];
  }

  get existsAPlan() {
    return Object.keys(this.createdPlans).length > 0;
  }

  openCreatePlanModal(planTitle) {
    this.selectedPlanTemplate = planTitle;
    // combine account data and plan template data
    this.currentPlanData = this.planTemplates[planTitle].map(planField => {
      for (const i in this.accountData) {
        if (planField.fieldName == this.accountData[i].fieldName) {
          const account: AccountForm = this.accountData[i];
          return Object.assign({
            fieldName: account.fieldName,
            isDefault: account.isDefault,
            formType: this.updateFormType(account.formType),
            prompt: "",
            subPrompt: planField.prompt,
            selectionOpts: account.selectionOpts,
            selected: Array.isArray(account.selected)
              ? planField.selected
              : account.selected,
            subSubPrompts: account.subSubPrompts ? account.subSubPrompts : []
          }) as FullFilteredPlan;
        }
      }
    }) as FullFilteredPlan[];

    this.currentPlanData.unshift({
      fieldName: "title",
      formType: "pure-component-textbox",
      isDefault: false,
      prompt: "Plan Name",
      subPrompt: "",
      selectionOpts: [""],
      selected: planTitle
    });

    // if the resolution is default, add it back in because it was filtered out
    if (this.resolutionIsDefault) {
      const resolutionItem = {
        fieldName: "resolution",
        formType: "does-not-matter",
        isDefault: true,
        prompt: "",
        selected: this.resolutionIsDefault,
        selectionOpts: [this.resolutionIsDefault],
        subPrompt: ""
      };
      this.currentPlanData.push(resolutionItem);
    }

    this.dialogOpen = true;
  }

  get randomKey() {
    return Math.floor(Math.random() * 1000);
  }

  get dehashPlans() {
    return Object.keys(this.createdPlans).map(key => {
      return {
        planKey: key,
        planData: this.createdPlans[key]
      };
    });
  }
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="the-create-plans-page">
    <VPageHeader>
      <template v-slot:icon
        ><v-icon color="primary" size="90">mdi-wrench </v-icon></template
      >
      <template v-slot:text><div class="text">Create Plans</div></template>
      <template v-slot:description>
        <div class="description">
          Every camera you own is subscribed to a Camio plan. We do this to
          ensure that you always get the best possible price. Select one of our
          premade plans or choose “Basic” to customize your own.
        </div>
      </template>
    </VPageHeader>
    <VPlanList
      :plans="dehashPlans"
      :showPlanCount="true"
      title="My Plans"
      @edit-plan="$emit('edit-plan', $event)"
    />
    <div class="plan-cards">
      <VPlanCard
        v-for="(plan, key) in planTemplates"
        :key="`${key}-plan-card`"
        :planTemplate="plan"
        :title="key"
        :class="{ margins: key % 2 === 0 }"
        :defaults="defaults"
        @create-plan="openCreatePlanModal($event)"
      />
    </div>
    <!-- Note: DialogOpen has to be here or the modal will not rebuild everytime
    and you end up with a bug where the user can't generate a plan if they click on the
    same plan template twice -->
    <TheCreatePlansModal
      v-if="currentPlanData"
      :key="`${selectedPlanTemplate}-${randomKey}-${dialogOpen}`"
      :dialog="dialogOpen"
      :planData="currentPlanData"
      :isVertical="isVertical"
      :title="selectedPlanTemplate"
      :defaults="defaults"
      :isEditing="false"
      @dialog-closed="dialogClosed($event)"
      @changed-form-item="updatePlan($event)"
      @resolution-change="cameraResolutionList = $event"
      @multi-resolution="isMultiResolution = $event"
    />
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.the-create-plans-page {
  display: flex;
  flex-direction: column;

  .plan-cards {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    align-self: center;
    max-width: 650px;

    @media only screen and (max-width: 961px) {
      justify-content: center;
    }
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
