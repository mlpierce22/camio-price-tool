<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Plan } from "@/models";
@Component({
  components: {}
})
export default class VPlanList extends Vue {
  // ---------- Props ----------
  @Prop() plans!: Plan;

  @Prop() title!: string;
  // ------- Local Vars --------

  // --------- Watchers --------

  // ------- Lifecycle ---------
  constructor() {
    super();
  }
  // --------- Methods ---------
  get unhashedPlan() {
    if (this.plans) {
      const planArray: any[] = [];
      Object.keys(this.plans).map(key => {
        planArray.push(this.plans[key]);
      });
      return planArray;
    } else {
      return undefined;
    }
  }
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="v-plan-list">
    <div class="no-plans" v-if="!unhashedPlan">
      <v-icon size="60" color="primary">mdi-clipboard-text</v-icon>
      <div class="explanation">
        You have not created any plans. Select from one of the templates below
        to create a plan.
      </div>
    </div>
    <div
      class="plans"
      v-for="(plan, index) in unhashedPlan"
      :key="`${index}-plan`"
    >
      {{ plan }}
    </div>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.v-plan-list {
  background: #fcf8e3;
  border: 3px solid #f7931e;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 650px;
  align-self: center;

  .no-plans {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 30px 0px;

    .explanation {
      font-weight: bold;
      text-align: center;
      color: #f7931e;
      margin-top: 10px;
      margin-left: 50px;
      margin-right: 50px;
    }
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
