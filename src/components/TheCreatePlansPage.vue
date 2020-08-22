<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import {
  PlanTemplates,
  AccountForm,
  AccountSubForm,
  PlanTemplateWithDefaults,
  Plan
} from "@/models";
import VPlanList from "@/components/shared/VPlanList.vue";
import VPlanCard from "@/components/shared/VPlanCard.vue";
@Component({
  components: {
    VPlanList,
    VPlanCard
  }
})
export default class TheCreatePlansPage extends Vue {
  // ---------- Props ----------
  @Prop() planTemplates!: PlanTemplates;

  @Prop() accountData!: Array<AccountForm | AccountSubForm>;

  @Prop() createdPlans!: Array<Plan>;
  // ------- Local Vars --------

  // --------- Watchers --------

  // ------- Lifecycle ---------
  constructor() {
    super();
    console.log("the form data:", this.accountData);
    console.log("the plan templates:", this.planTemplates);
  }
  // --------- Methods ---------

  get planTemplateDefaults() {
    return Object.keys(this.planTemplates).map(key => {
      return {
        key: key,
        value: this.planTemplates[key].map((planItem, index) => {
          if (planItem.fieldName == this.accountData[index].fieldName) {
            return Object.assign(planItem, {
              isDefault: (this.accountData[index] as AccountForm).isDefault,
              key
            }) as PlanTemplateWithDefaults;
          } else {
            // otherwise, it's out of order, so we need to search everything
            for (const i in this.accountData) {
              if (planItem.fieldName == this.accountData[i].fieldName) {
                return Object.assign(planItem, {
                  isDefault: (this.accountData[i] as AccountForm).isDefault
                }) as PlanTemplateWithDefaults;
              }
            }
          }
        })
      };
    });
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
      />
    </div>
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
    max-width: 630px;

    @media only screen and (max-width: 945px) {
      justify-content: center;
    }
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
