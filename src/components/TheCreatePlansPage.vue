<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { PlanTemplates, AccountForm, Plan, FullFilteredPlan } from "@/models";
import VPlanList from "@/components/shared/VPlanList.vue";
import VPlanCard from "@/components/shared/VPlanCard.vue";
import TheCreatePlansModal from "@/components/TheCreatePlansModal.vue";
import { DefaultMap } from "@/new-models";

@Component({
  components: {
    VPlanList,
    VPlanCard,
    TheCreatePlansModal
  }
})
export default class TheCreatePlansPage extends Vue {
  // ---------- Props ----------
  @Prop() planTemplates!: PlanTemplates;

  @Prop() accountData!: Array<AccountForm>;

  @Prop() defaults!: DefaultMap;

  @Prop() createdPlans!: Plan;

  @Prop() isVertical!: boolean;
  // ------- Local Vars --------

  dialogOpen = false;

  currentPlanData: FullFilteredPlan[] = [];

  isMultiResolution = false;

  cameraResolutionList = [];

  selectedPlanTemplate = "Basic";

  // --------- Watchers --------

  // ------- Lifecycle ---------
  // TODO: Replace the constructor with created everywhere
  constructor() {
    super();
    console.log("the form data:", this.accountData);
    console.log("the plan templates:", this.planTemplates);
  }
  // --------- Methods ---------

  dialogClosed(isSubmit) {
    // update the data structure in parent (probably plans)
    if (isSubmit) {
      this.createPlans();
    }
    this.dialogOpen = false;
    this.currentPlanData = undefined;
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

  openCreatePlanModal(planTitle) {
    this.selectedPlanTemplate = planTitle;
    console.log("plan templates:", this.planTemplates);
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
            subPrompt: planField.label,
            selectionOpts: account.selectionOpts,
            selected: account.selected,
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
    <VPlanList :plans="dehashPlans" title="My Plans" />
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
    <TheCreatePlansModal
      v-if="currentPlanData"
      :key="`${selectedPlanTemplate}-${randomKey}`"
      :dialog="dialogOpen"
      :planData="currentPlanData"
      :isVertical="isVertical"
      :title="selectedPlanTemplate"
      :defaults="defaults"
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
