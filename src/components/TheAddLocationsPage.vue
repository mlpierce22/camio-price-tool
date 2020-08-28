<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import {
  Plan,
  DeconstructedHashPlan,
  Location,
  QuoteIntroForm
} from "@/models";
import VPlanList from "@/components/shared/VPlanList.vue";
import VLocationCameraDropdown from "@/components/shared/VLocationCameraDropdown.vue";
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

  //TODO: get current locations too because otherwise we reset on vertical
  // ------- Local Vars --------

  // currentPlans: Array<DeconstructedHashPlan> | [] = [];

  furthestLocation = 0;

  locations: Location = {};

  // --------- Watchers --------
  @Watch("locations", { deep: true })
  locationChanged() {
    this.$emit("update-location-app", this.locations);
    console.log("locations updated!");
    //console.log("update location!", this.locations);
  }

  @Watch("initialFormData.numLANLocations", { deep: true })
  formDataChange(event) {
    console.log("reinitializing");
    if (event > this.furthestLocation) {
      // start at furthest and iterate until closest
    } else if (event < this.furthestLocation) {
      // splice out the elements from the event till the end
    } else {
      // they are equal
    }
    // TODO: We want to update this lan locations when we do the add locations button, but we would have an infinite loop here if we did that (what if we just added if there were more?) slice if there are too many, add extras if there arent
    for (let i = 1; i <= this.initialFormData["numLANLocations"].value; i++) {
      this.furthestLocation = i;
      this.$set(this.locations, i, {
        title: "Location " + i,
        numCameras: 1,
        planCounts: { 1: 1 }, // set some default so the empty card displays
        useVM: false
      });
    }
    this.$emit("update-location-app", this.locations);
  }
  // ------- Lifecycle ---------
  constructor() {
    super();
    // for (let i = 1; i <= this.initialFormData["numLANLocations"].value; i++) {
    //   this.furthestLocation = i;
    //   this.$set(this.locations, i, {
    //     title: "Location " + i,
    //     numCameras: 1,
    //     planCounts: { 1: 1 }, // set some default so the empty card displays
    //     useVM: false
    //   });
    // }
    console.log("called!");
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
        sumAssigned: Object.keys(this.locations)
          .map(locKey => {
            return this.locations[locKey].planCounts[planKey]
              ? this.locations[locKey].planCounts[planKey]
              : 0;
          })
          .reduce((prev, curr) => {
            return prev + curr;
          })
      };
    });
    this.$emit("assigned-plans-updated", assignedPlans);

    // update the num camera counts
    Object.keys(this.locations).map(key => {
      const totalLocCams = Object.keys(this.locations[key].planCounts)
        .map(planKey => {
          return this.locations[key].planCounts[planKey];
        })
        .reduce((prev, curr) => {
          return prev + curr;
        });
      console.log(
        "this should be a number representing all the location's cameras added up!",
        totalLocCams
      );
      this.$set(this.locations[key], "numCameras", totalLocCams);
    });

    // for each location, iterate through plans and add them to overall count, once iterated through all plans, set num cameras equal to result
    // for each planid in the plans
    // search through all locations and if that plan exists, add it to the total
    // assign that count to the "assigned" part of plans via the parent (emit)
  }

  createLocation() {
    this.furthestLocation++;
    const newLocNum = this.furthestLocation;
    this.$set(this.locations, newLocNum, {
      title: "Location " + newLocNum,
      numCameras: 1,
      planCounts: { 1: 1 }, // set some default
      useVM: false
    });

    this.$emit("location-increased"); // TODO: handle Do we need to update num lan locations?
  }

  deleteLocation(index) {
    //TODO: is this necessary?
    this.$delete(this.locations, index);
    this.$emit("location-decreased"); // TODO: handle
  }

  updateLocation(index, payload) {
    this.$set(this.locations[index], payload.field, payload.payload);
  }

  openEditModal() {
    console.log("opening the edit modal"); // TODO: what should happen here?
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
