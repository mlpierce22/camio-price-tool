<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { DeconstructedHashPlan, PlanCount, Plan } from "@/models";
import VPromptedNumberInput from "@/components/shared/VPromptedNumberInput.vue";
@Component({
  components: {
    VPromptedNumberInput
  }
})
export default class VCameraAssignmentDropdownCard extends Vue {
  // ---------- Props ----------
  @Prop() planId!: number;

  @Prop() plansAsArray!: Array<DeconstructedHashPlan>;

  @Prop() plans!: Plan;

  @Prop() numCameras!: number;

  @Prop() canDelete!: boolean;
  // ------- Local Vars --------
  planOptions = [];

  planCards = [];

  selected = {};

  showMore = false;

  camCount: string;

  rules = {
    min: value => value >= 1 || "1+ required."
  };
  // --------- Watchers --------
  @Watch("camCount")
  camChange() {
    this.$emit("camera-count-change", parseInt(this.camCount));
  }

  @Watch("selected")
  planChange() {
    this.$emit("plan-change", this.selected);
  }
  // ------- Lifecycle ---------
  constructor() {
    super();
    this.camCount = this.numCameras + "";
    this.selected = {
      text: this.plans[this.planId] ? this.plans[this.planId].title : "",
      value: this.planId
    };
  }
  // --------- Methods ---------
  get planTitles() {
    return this.plansAsArray.map(plan => {
      return {
        text: plan.planData.title,
        value: plan.planKey
      };
    });
  }
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="v-camera-assignment-dropdown-card">
    <v-text-field
      class="text-box"
      v-model="camCount"
      background-color="white"
      color="primary"
      min="1"
      step="1"
      type="number"
      outlined
      dense
      :validate-on-blur="true"
      :rules="[rules.min]"
    ></v-text-field>
    <div class="card" @click="showMore = !showMore">
      <div class="dropdown-icon">
        <v-icon class="list" color="white">mdi-format-list-bulleted</v-icon>
        <v-select
          class="select"
          :items="planTitles"
          v-model="selected"
          label="Plan"
          hide-details
          outlined
          dense
          dark
        ></v-select>
      </div>
      <div class="icons">
        <v-btn icon color="white" class="pencil" @click="$emit('edit')">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          icon
          class="trash"
          color="white"
          :disabled="!canDelete"
          @click="$emit('delete')"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </div>
    <v-expand-transition>
      <div v-show="showMore" class="additional-details"></div>
    </v-expand-transition>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.v-camera-assignment-dropdown-card {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 10px;

  ::v-deep .text-box {
    max-width: 70px;
    margin-top: 5px;

    .v-input__slot {
      margin: 0px;
    }

    .v-text-field__details {
      padding: 0px;
      margin: 0px;
    }
    input {
      text-align: center;
    }
  }

  .card {
    display: flex;
    background: #f7931e;
    border-radius: 10px;
    padding: 5px 0px 5px 10px;
    margin-left: 10px;
    flex-grow: 1;

    .dropdown-icon {
      display: flex;
      flex-direction: row;

      .select {
        max-width: 240px;
        margin-left: 5px;
      }
    }

    .icons {
      display: flex;
      flex-direction: row;
      margin-left: auto;

      .pencil {
        margin-left: auto;
      }
      .trash {
        margin: 0px 5px;
      }
    }
  }

  @media only screen and (max-width: 450px) {
    flex-direction: column;
    ::v-deep .text-box {
      align-self: center;
    }
    .card {
      align-self: center;
      flex-direction: column;
      margin-left: 0px;
      padding: 5px;

      .icons {
        align-self: center;

        .pencil {
          margin-left: 0px;
        }
      }
    }
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
