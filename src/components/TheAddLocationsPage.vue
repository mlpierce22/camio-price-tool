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

  // currentPlans: Array<DeconstructedHashPlan> | [] = [];

  // furthestLocation = 0;

  // --------- Watchers --------

  // @Watch("initialFormData.numLANLocations", { deep: true })
  // formDataChange(event) {
  //   console.log("reinitializing", event);
  //   if (event.value > this.furthestLocation) {
  //     // start at furthest and iterate until closest
  //     for (let i = this.furthestLocation; i < event.value; ++i) {
  //       this.createLocation();
  //     }
  //   } else if (event.value < this.furthestLocation) {
  //     Object.keys(this.locations).forEach(key => {
  //       if (key > event) {
  //         this.deleteLocation(key);
  //       }
  //     });
  //     // splice out the elements from the event till the end
  //   } else {
  //     // they are equal
  //   }
  // TODO: We want to update this lan locations when we do the add locations button, but we would have an infinite loop here if we did that (what if we just added if there were more?) slice if there are too many, add extras if there arent
  // for (let i = 1; i <= this.initialFormData["numLANLocations"].value; i++) {
  //   this.furthestLocation = i;
  //   this.$set(this.locations, i, {
  //     title: "Location " + i,
  //     numCameras: 1,
  //     planIds: { 1: 1 }, // set some default so the empty card displays
  //     useVM: false
  //   });
  // }
  //this.$emit("update-location-app", this.locations);
  // }
  // ------- Lifecycle ---------
  constructor() {
    super();
    // for (let i = 1; i <= this.initialFormData["numLANLocations"].value; i++) {
    //   this.furthestLocation = i;
    //   this.$set(this.locations, i, {
    //     title: "Location " + i,
    //     numCameras: 1,
    //     planIds: { 1: 1 }, // set some default so the empty card displays
    //     useVM: false
    //   });
    // }
    // console.log("called!");
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
      // this.$set(this.locations[key], "numCameras", totalLocCams);
    });

    // for each location, iterate through plans and add them to overall count, once iterated through all plans, set num cameras equal to result
    // for each planid in the plans
    // search through all locations and if that plan exists, add it to the total
    // assign that count to the "assigned" part of plans via the parent (emit)
  }

  createLocation() {
    this.$emit("add-location");
    // this.furthestLocation++;
    // const newLocNum = this.furthestLocation;
    // this.$set(this.locations, newLocNum, {
    //   title: "Location " + newLocNum,
    //   numCameras: 1,
    //   planIds: { 1: 1 }, // set some default
    //   useVM: false
    // });

    // this.$emit("add-location", Object.keys(this.locations).length);
  }

  deleteLocation(index: number) {
    // this.$delete(this.locations, index);
    this.$emit("delete-location", index);
    // this.$emit("location-count-change", Object.keys(this.locations).length);
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
