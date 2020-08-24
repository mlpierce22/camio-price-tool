<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import {
  PlanTemplates,
  AccountForm,
  AccountSubForm,
  PlanTemplateWithDefaults,
  Plan,
  FullFilteredPlan
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

  @Prop() createdPlans!: Array<Plan>;

  @Prop() isVertical!: boolean;
  // ------- Local Vars --------

  dialogOpen = false;

  currentPlanData: any = {}; // TODO: Type
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

  dialogClosed() {
    // update the data structure in parent (probably plans)
    this.dialogOpen = false;
  }

  updateFormType(formType: string): string {
    return formType.replace("yes-no-select", "pure-component");
  }

  openCreatePlanModal(planTitle) {
    // combine account data and plan template data
    this.currentPlanData = this.planTemplates[planTitle].map(
      (planField, index) => {
        if (planField.fieldName == this.filteredAccountData[index].fieldName) {
          const account: AccountForm = this.filteredAccountData[index];
          return Object.assign(planField, {
            isDefault: account.isDefault,
            formType: account.formType,
            prompt: account.prompt,
            subPrompt: account.subPrompt,
            selectionOpts: account.selectionOpts,
            subSubPrompt: account.subSubPrompt ? account.subSubPrompt : ""
          }) as FullFilteredPlan;
        } else {
          for (const i in this.filteredAccountData) {
            if (planField.fieldName == this.filteredAccountData[i].fieldName) {
              const account: AccountForm = this.filteredAccountData[i];
              return Object.assign({
                fieldName: account.fieldName,
                isDefault: account.isDefault,
                formType: this.updateFormType(account.formType),
                prompt: account.prompt,
                subPrompt: account.subPrompt,
                selectionOpts: account.selectionOpts,
                selected: account.selected,
                subSubPrompt: account.subSubPrompt ? account.subSubPrompt : ""
              }) as FullFilteredPlan;
            }
          }
        }
      }
    );
    this.dialogOpen = true;
  }
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="the-create-plans-page">
    <VPlanList />
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
      :dialog="dialogOpen"
      :planData="currentPlanData"
      :isVertical="isVertical"
      @dialog-closed="dialogClosed()"
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
