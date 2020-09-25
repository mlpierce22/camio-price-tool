<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { DeconstructedHashPlan, Plan } from "@/models";
import VTextInput from "@/components/shared/form_items/VTextInput.vue";
import VCameraAssignmentDropdownCard from "@/components/shared/VCameraAssignmentDropdownCard.vue";
import { LocationAttributes } from "@/new-models";
@Component({
  components: {
    VTextInput,
    VCameraAssignmentDropdownCard
  }
})
export default class VLocationCameraDropdown extends Vue {
  // ---------- Props ----------
  @Prop() plans!: Plan;

  @Prop() dehashPlans!: Array<DeconstructedHashPlan>;

  @Prop() location!: LocationAttributes;

  @Prop() canDelete!: boolean;

  // ------- Local Vars --------
  isOpen: number | undefined = 0;

  inputValue: string;

  hasVM: boolean;

  counter = 50;

  initialPlan = {};

  rules = {
    empty: value => !!value || "Required.",
    max: v => v.length <= this.counter || `Max ${this.counter} characters`
    // TODO: Add exists rule! (here and in template)
    // exists: value => {
    //   this.$root.$data["plans"];
    // }
  };
  // --------- Watchers --------
  @Watch("inputValue")
  inputChange() {
    this.$emit("update-location", { field: "title", payload: this.inputValue });
  }

  @Watch("hasVM")
  useVMChange() {
    this.$emit("update-location", { field: "useVM", payload: this.hasVM });
  }
  // ------- Lifecycle ---------
  constructor() {
    super();
    this.inputValue = this.location.title;
    this.hasVM = this.location.useVM;
  }
  // --------- Methods ---------
  toggleOpen() {
    if (this.isOpen == 0) {
      this.isOpen = undefined;
    } else {
      this.isOpen = 0;
    }
  }

  edit(id) {
    this.$emit("edit-plan", id);
  }

  deletePlan(id) {
    const locationCountCopy = { ...this.location.planIds };
    delete locationCountCopy[id];
    this.$emit("update-location", {
      field: "planIds",
      payload: locationCountCopy
    });
    this.$emit("update-counts");
  }

  addPlan() {
    const locationCountCopy = { ...this.location.planIds };
    locationCountCopy[Math.floor(Math.random() * 1234)] = 1;
    this.$emit("update-location", {
      field: "planIds",
      payload: locationCountCopy
    });
    this.$emit("update-counts");
  }

  countChange(id, newCount) {
    const locationCountCopy = { ...this.location.planIds };
    locationCountCopy[id] = newCount;
    this.$emit("update-location", {
      field: "planIds",
      payload: locationCountCopy
    });
    this.$emit("update-counts");
  }

  planChange(planToSwap, newPlanId) {
    // Don't need to update if they selected the same thing they already had
    if (planToSwap !== newPlanId) {
      console.log(`swap ${planToSwap} with ${newPlanId}`);
      const locationCountCopy = { ...this.location.planIds };
      const swappedCount = locationCountCopy[planToSwap];
      locationCountCopy[newPlanId] = swappedCount;
      delete locationCountCopy[planToSwap];
      this.$emit("update-location", {
        field: "planIds",
        payload: locationCountCopy
      });
      this.$emit("update-counts");
    }
  }

  get canDeletePlan() {
    return Object.keys(this.location.planIds).length - 1 > 0;
  }

  get canAddNewPlan() {
    return (
      this.dehashPlans.filter(dehashedPlan => {
        return !Object.keys(this.location.planIds).includes(
          dehashedPlan.planKey
        );
      }).length > 0
    );
  }
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="v-location-camera-dropdown">
    <v-expansion-panels v-model="isOpen" flat readonly color="secondary">
      <v-expansion-panel>
        <v-expansion-panel-header class="location-header">
          <div class="header">
            <v-text-field
              class="text-box"
              v-model="inputValue"
              background-color="#CBE3C4"
              color="#50B536"
              :counter="counter"
              hide-details
              outlined
              :validate-on-blur="true"
              :rules="[rules.empty, rules.max]"
            ></v-text-field>
            <v-checkbox
              class="checkbox"
              v-model="hasVM"
              hide-details
              label="Use VM at this location."
            ></v-checkbox>
          </div>

          <template v-slot:actions>
            <v-btn icon color="secondary" @click="toggleOpen">
              <v-icon size="40" color="secondary">mdi-chevron-down</v-icon>
            </v-btn>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <div class="location-container">
            <div class="camera-plan">
              <VCameraAssignmentDropdownCard
                v-for="(content, id) in location.planIds"
                :key="`${id}-camera-plan`"
                :planId="id"
                :plansAsArray="dehashPlans"
                :numCameras="content"
                :plans="plans"
                :location="location"
                :canDelete="canDeletePlan"
                @edit="edit(id)"
                @delete="deletePlan(id)"
                @camera-count-change="countChange(id, $event)"
                @plan-change="planChange(id, $event)"
              />
            </div>
            <v-btn
              icon
              color="primary"
              x-large
              :disabled="!canAddNewPlan"
              class="add-new"
              @click="addPlan()"
            >
              <v-icon>mdi-plus-circle-outline</v-icon>
            </v-btn>
            <v-btn
              class="delete"
              :disabled="!canDelete"
              x-small
              outlined
              color="error"
              @click="$emit('delete-location')"
              >Delete Location</v-btn
            >
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.v-location-camera-dropdown {
  display: flex;
  flex-direction: column;

  ::v-deep .v-expansion-panels {
    border: 3px solid #50b536;
    border-radius: 10px;
    max-width: 650px;
    align-self: center;
    margin-top: 10px;

    .v-expansion-panel {
      .location-header {
        color: #50b536 !important;
        cursor: default;

        .header {
          display: flex;
          justify-content: flex-start;

          .v-text-field {
            max-width: 140px;
          }
          .checkbox {
            margin-left: 20px;
          }

          @media only screen and (max-width: 550px) {
            flex-direction: column;

            .checkbox {
              margin-left: 0px;
            }
          }
        }

        @media only screen and (max-width: 450px) {
          padding-left: 10px;
          padding-right: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .text {
          font-weight: bold;

          @media only screen and (max-width: 450px) {
            justify-self: center;
          }

          &.open {
            text-decoration: underline;
          }
        }
      }
      .v-expansion-panel-header__icon {
        // @media only screen and (max-width: 450px) {
        //   display: none;
        // }
      }
      .v-expansion-panel-content__wrap {
        background: rgba(203, 227, 196, 0.13);
        border-top: 3px solid #50b536;

        @media only screen and (max-width: 450px) {
          padding-left: 10px;
          padding-right: 10px;
          padding-top: 0px;
        }

        .location-container {
          display: flex;
          flex-direction: column;

          .camera-plan {
            display: flex;
            flex-direction: column-reverse;
            margin-top: 20px;
          }

          .add-new {
            align-self: center;
          }

          .delete {
            align-self: flex-end;
          }
        }
      }
    }
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
