<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { Plan, DeconstructedHashPlan, QuoteIntroForm } from "@/models";
import VPlanList from "@/components/shared/VPlanList.vue";
import VLocationCameraDropdown from "@/components/shared/VLocationCameraDropdown.vue";
import { LocationHashes } from "@/new-models";
@Component({
  components: {
    VPlanList,
    VLocationCameraDropdown
  }
})
export default class TheAddLocationsPage extends Vue {
  // ---------- Props ----------
  @Prop() plans!: Plan;

  @Prop() initialFormData!: QuoteIntroForm;

  @Prop() locations!: LocationHashes;
  // ------- Local Vars --------

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

  updatePlanCamCounts() {
    const assignedPlans = Object.keys(this.plans).map(planKey => {
      return {
        planId: planKey,
        field: "camerasAssigned",
        payload: Object.keys(this.locations)
          .map(locKey => {
            return this.locations[locKey].planIds[planKey]
              ? this.locations[locKey].planIds[planKey]
              : 0;
          })
          .reduce((prev, curr) => {
            return prev + curr;
          })
      };
    });
    this.$emit("modify-plan", assignedPlans);

    // update the num camera counts in location
    Object.keys(this.locations).map(key => {
      const totalLocCams = Object.keys(this.locations[key].planIds)
        .map(planKey => {
          return this.locations[key].planIds[planKey];
        })
        .reduce((prev, curr) => {
          return prev + curr;
        });
      this.$emit("modify-location", {
        index: parseInt(key),
        field: "numCameras",
        payload: totalLocCams
      });
    });
  }

  createLocation() {
    this.$emit("add-location");
  }

  deleteLocation(index: number) {
    this.$emit("delete-location", index);
  }

  // TODO: is the plan cam count in the location updated??
  updateLocation(index, payload) {
    this.$emit("modify-location", {
      index: parseInt(index),
      field: payload.field,
      payload: payload.payload
    });
  }

  openEditModal() {
    console.log("editing!"); // TODO: what should happen here?
  }
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="the-add-locations-page">
    <VPlanList :plans="dehashPlans" title="Plans Left To Assign" />
    <div class="locations">
      <VLocationCameraDropdown
        v-for="(location, index) in locations"
        :key="`${index}-location-dropdown`"
        :plans="plans"
        :dehashPlans="dehashPlans"
        :location="location"
        :canDelete="index > 1"
        @update-location="updateLocation(index, $event)"
        @edit-plan="openEditModal"
        @delete-location="deleteLocation(index)"
        @create-location="createLocation()"
        @update-counts="updatePlanCamCounts()"
      />
    </div>
    <v-btn
      class="add-location"
      outlined
      color="secondary"
      @click="createLocation()"
      >Add Location +</v-btn
    >
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.the-add-locations-page {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;

  .add-location {
    margin-top: 50px;
    align-self: center;
    border-width: 3px;
    font-weight: bold;
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
