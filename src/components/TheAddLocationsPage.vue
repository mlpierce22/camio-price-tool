<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { Plan, DeconstructedHashPlan } from "@/models";
import VPlanList from "@/components/shared/VPlanList.vue";
@Component({
  components: {
    VPlanList
  }
})
export default class TheAddLocationsPage extends Vue {
  // ---------- Props ----------
  @Prop() plans!: Plan;

  // ------- Local Vars --------

  currentPlans: Array<DeconstructedHashPlan> | [] = [];
  // --------- Watchers --------

  // ------- Lifecycle ---------
  constructor() {
    super();
  }

  // --------- Methods ---------
  get dehashPlans() {
    return Object.keys(this.plans).map(key => {
      return {
        planKey: key,
        planData: this.plans[key]
      };
    });
  }
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="the-add-locations-page">
    <VPlanList :plans="dehashPlans" title="Plans Left To Assign" />
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.the-add-locations-page {
}
</style>
<!----------------- END CSS/SCSS ------------------>
