<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import {
  Plan,
  DeconstructedHashPlan,
  QuoteIntroForm,
  ProgressionState
} from "@/models";
import VPlanList from "@/components/shared/VPlanList.vue";
import VLocationCameraDropdown from "@/components/shared/VLocationCameraDropdown.vue";
import VPageHeader from "@/components/shared/VPageHeader.vue";

import { LocationHashes } from "@/new-models";
@Component({
  components: {
    VPlanList,
    VLocationCameraDropdown,
    VPageHeader
  }
})
export default class TheAddLocationsPage extends Vue {
  // ---------- Props ----------
  @Prop() plans!: Plan;

  @Prop() initialFormData!: QuoteIntroForm;

  @Prop() locations!: LocationHashes;

  @Prop() progressionState!: ProgressionState;
  // ------- Local Vars --------

  allCamerasUsed = false;
  // --------- Watchers --------
  @Watch("allCamerasUsed")
  camerasUsedChange() {
    this.checkAdvanceStatus();
  }
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

  get isEmptyLocation() {
    // if for every location, every planId at that location exists in plans (dummy keys tell us that there is an empty slot present at one of the locations)
    return !Object.keys(this.locations).every(locKey => {
      return Object.keys(this.locations[locKey].planIds).every(planKey => {
        return !!this.plans[planKey];
      });
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
    this.checkAdvanceStatus();
  }

  deleteLocation(index: number) {
    this.$emit("delete-location", index);
    this.checkAdvanceStatus();
  }

  // TODO: is the plan cam count in the location updated??
  updateLocation(index, payload) {
    this.$emit("modify-location", {
      index: parseInt(index),
      field: payload.field,
      payload: payload.payload
    });
    this.checkAdvanceStatus();
  }

  checkAdvanceStatus() {
    console.log(
      "check advance status, cameras all used and all locations filled: ",
      this.allCamerasUsed,
      !this.isEmptyLocation
    );
    // only allow to unlock next button if all cameras are used and none of the locations are empty
    if (this.allCamerasUsed && !this.isEmptyLocation) {
      this.$emit("location-advancement-change", {
        stepToChange: this.progressionState.locationStepId,
        canAdvance: true
      });
    } else {
      this.$emit("location-advancement-change", {
        stepToChange: this.progressionState.locationStepId,
        canAdvance: false
      });
    }
  }
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="the-add-locations-page">
    <VPageHeader>
      <template v-slot:icon
        ><v-icon color="primary" size="90">mdi-store </v-icon></template
      >
      <template v-slot:text><div class="text">Add Locations</div></template>
      <template v-slot:description>
        <div class="description">
          Add your plans to each of your LAN locations. Plans can be split
          between multiple locations and you must assign all cameras to at least
          one location before you can move on.
        </div>
      </template>
    </VPageHeader>
    <VPlanList
      :plans="dehashPlans"
      title="Plans Left To Assign"
      @edit-plan="$emit('edit-plan', $event)"
      @can-advance="allCamerasUsed = $event"
    />
    <div class="locations">
      <VLocationCameraDropdown
        v-for="(location, index) in locations"
        :key="`${index}-location-dropdown`"
        :plans="plans"
        :dehashPlans="dehashPlans"
        :location="location"
        :canDelete="index > 1"
        @update-location="updateLocation(index, $event)"
        @edit-plan="$emit('edit-plan', $event)"
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
