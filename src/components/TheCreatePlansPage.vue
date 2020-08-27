<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import {
  PlanTemplates,
  AccountForm,
  AccountSubForm,
  PlanTemplateWithDefaults,
  Plan,
  FullFilteredPlan,
  PlanAttributes,
  CamResolution,
  BasePlanOpts,
  AddOn
} from "@/models";
import VPlanList from "@/components/shared/VPlanList.vue";
import VPlanCard from "@/components/shared/VPlanCard.vue";
import TheCreatePlansModal from "@/components/TheCreatePlansModal.vue";

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

  @Prop() accountData!: Array<AccountForm | AccountSubForm>;

  @Prop() createdPlans!: Plan;

  @Prop() isVertical!: boolean;
  // ------- Local Vars --------

  dialogOpen = false;

  currentPlanData: FullFilteredPlan[] | undefined = [];

  isMultiResolution = false;

  cameraResolutionList = [];

  selectedPlanTemplate = "Basic";

  // --------- Watchers --------

  // ------- Lifecycle ---------
  constructor() {
    super();
    console.log("the form data:", this.filteredAccountData);
    console.log("the plan templates:", this.planTemplates);
  }
  // --------- Methods ---------
  get filteredAccountData(): AccountForm {
    return (this.accountData.filter(
      field => field.fieldName !== "advancedOptions"
    ) as unknown) as AccountForm;
  }

  get planTemplateDefaults() {
    return Object.keys(this.planTemplates).map(key => {
      return {
        key: key,
        value: this.planTemplates[key].map((planItem, index) => {
          if (planItem.fieldName == this.filteredAccountData[index].fieldName) {
            return Object.assign(planItem, {
              isDefault: (this.filteredAccountData[index] as AccountForm)
                .isDefault,
              key
            }) as PlanTemplateWithDefaults;
          } else {
            // otherwise, it's out of order, so we need to search everything
            for (const i in this.filteredAccountData) {
              if (planItem.fieldName == this.filteredAccountData[i].fieldName) {
                return Object.assign(planItem, {
                  isDefault: (this.filteredAccountData[i] as AccountForm)
                    .isDefault
                }) as PlanTemplateWithDefaults;
              }
            }
          }
        })
      };
    });
  }

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
    console.log("create plan!");
    const plans = this.cameraResolutionList.map(
      (cameraResolution: CamResolution) => {
        const purePlanObj = {};
        (this.currentPlanData as FullFilteredPlan[]).map(planField => {
          // Assign the title to the resolution field (since it isnt handled in the plan)
          if (planField.fieldName == "resolution") {
            purePlanObj[planField.fieldName] = cameraResolution.title;

            // handle custom naming if multiple resolutions
          } else if (
            planField.fieldName == "title" &&
            this.cameraResolutionList.length > 1
          ) {
            purePlanObj[planField.fieldName] =
              planField.selected + " w/" + cameraResolution.title;
          } else {
            purePlanObj[planField.fieldName] = planField.selected;
          }
        });

        // Add num cameras field
        purePlanObj["numCameras"] = cameraResolution.numCameras;
        // represents how many cameras are assigned to a location
        purePlanObj["camerasAssigned"] = 0;
        return purePlanObj;
      }
    );
    this.$emit("create-plans-final", [...plans]);
    this.cameraResolutionList = [];
    this.isMultiResolution = false;
  }

  updatePlan(updateInfo) {
    console.log("updateInfo", updateInfo);
    (this.currentPlanData as FullFilteredPlan[])[updateInfo.index].selected =
      updateInfo.payload;
  }

  handleSelected(fromPlan: BasePlanOpts, fromAccount: AccountForm) {
    if (
      Array.isArray(fromAccount.selected) &&
      Array.isArray(fromPlan.selected)
    ) {
      // then we need to handle addons accordingly
      console.log(
        "this is from account, then from plan",
        fromAccount,
        fromPlan
      );
      if (fromAccount.isDefault) {
        // return the ones to exclude
        return [...(fromAccount.selected as [])];
      } else {
        return [...(fromPlan.selected as [])];
        // return the ones to include (with rate 100)
      }
    } else {
      return fromAccount.selected;
    }
  }

  openCreatePlanModal(planTitle) {
    this.selectedPlanTemplate = planTitle;
    console.log("plan templates:", this.planTemplates);
    // combine account data and plan template data
    // Add-ons explanation:
    // if an add-on "isDefault" = true, then everything in the selected array for account is the ones that are default (we cancel those checkboxes out).
    // if an addon "isDefault" = false, then everything in the selected array should come from the plan template
    // TODO: get rid of conditional? how much is the speedup really?
    this.currentPlanData = this.planTemplates[planTitle].map(
      (planField, index) => {
        console.log("the planfield: ", planField, index);
        if (planField.fieldName == this.filteredAccountData[index].fieldName) {
          const account: AccountForm = this.filteredAccountData[index];
          return Object.assign({
            fieldName: account.fieldName,
            isDefault: account.isDefault,
            formType: account.formType,
            prompt: "",
            subPrompt: planField.label,
            selectionOpts: account.selectionOpts,
            selected: this.handleSelected(planField, account),
            subSubPrompts: account.subSubPrompts ? account.subSubPrompts : []
          }) as FullFilteredPlan;
        } else {
          for (const i in this.filteredAccountData) {
            if (planField.fieldName == this.filteredAccountData[i].fieldName) {
              const account: AccountForm = this.filteredAccountData[i];
              console.log(
                "adding field",
                planField.fieldName,
                "It has these attibs in account",
                this.filteredAccountData[i]
              );
              return Object.assign({
                fieldName: account.fieldName,
                isDefault: account.isDefault,
                formType: this.updateFormType(account.formType),
                prompt: "",
                subPrompt: planField.label,
                selectionOpts: account.selectionOpts,
                selected: this.handleSelected(planField, account),
                subSubPrompts: account.subSubPrompts
                  ? account.subSubPrompts
                  : []
              }) as FullFilteredPlan;
            }
          }
        }
      }
    ) as FullFilteredPlan[];

    this.currentPlanData.unshift({
      fieldName: "title",
      formType: "pure-component-textbox",
      isDefault: false,
      prompt: "Plan Name",
      subPrompt: "",
      selectionOpts: [""],
      selected: planTitle
    });

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
        v-for="(plan, key) in planTemplateDefaults"
        :key="`${key}-plan-card`"
        :planTemplate="plan.value"
        :title="plan.key"
        :class="{ margins: key % 2 === 0 }"
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

    @media only screen and (max-width: 945px) {
      justify-content: center;
    }
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
