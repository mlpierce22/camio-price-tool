<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { Plan, PlanAttributes, DeconstructedHashPlan } from "@/models";
@Component({
  components: {}
})
export default class VPlanList extends Vue {
  // ---------- Props ----------
  @Prop() plans!: Array<DeconstructedHashPlan>;

  @Prop() title!: string;
  // ------- Local Vars --------

  // --------- Watchers --------

  // TODO: Add watcher to total plans function to determine if user can continue

  // ------- Lifecycle ---------
  constructor() {
    super();
  }
  // --------- Methods ---------

  camerasRemaining(plan: DeconstructedHashPlan) {
    return plan.planData.numCameras - plan.planData.camerasAssigned;
  }
  getColor(plan: DeconstructedHashPlan) {
    const cameraCount = this.camerasRemaining(plan);
    if (cameraCount > 0) {
      return "primary";
    } else if (cameraCount == 0) {
      return "secondary";
    } else {
      return "error";
    }
  }

  get totalPlansLeftToAssign() {
    if (this.plans.length > 0) {
      return this.plans
        .map(plan => {
          return this.camerasRemaining(plan);
        })
        .reduce((prevPlan, currPlan) => {
          return prevPlan + currPlan;
        });
    } else {
      return 999;
    }
  }
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="v-plan-list">
    <div class="plan-title">{{ title }}:</div>
    <div class="plan-container" :class="{ done: totalPlansLeftToAssign == 0 }">
      <div class="no-plans" v-if="plans.length == 0" key="plans-do-not-exist">
        <v-icon size="60" color="primary">mdi-clipboard-text</v-icon>
        <div class="explanation unstarted">
          You have not created any plans. Select from one of the templates below
          to create a plan.
        </div>
      </div>
      <div
        class="show-plans"
        v-else-if="plans.length !== 0 && totalPlansLeftToAssign !== 0"
        key="plans-exist"
      >
        <div class="num-cameras">
          # cameras
        </div>

        <div
          class="plans"
          v-for="(plan, index) in plans"
          :key="`${index}-plan`"
        >
          <v-hover v-slot:default="{ hover }">
            <div v-ripple color="primary" class="hover-container">
              <div class="plan-count" :class="`${getColor(plan)}--text`">
                {{ camerasRemaining(plan) }}
              </div>
              <div class="plan-sub-title" :class="`${getColor(plan)}--text`">
                {{ plan.planData.title }}
              </div>
              <v-icon class="pencil" :color="getColor(plan)" v-show="hover"
                >mdi-pencil</v-icon
              >
            </div>
          </v-hover>
        </div>
      </div>
      <div class="no-plans" v-else key="plans-done">
        <v-icon size="60" color="secondary">mdi-check-circle</v-icon>
        <div class="explanation finished">
          You assigned all your plans! Click “Review Quote” at the bottom of the
          page to continue.
        </div>
      </div>
    </div>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.v-plan-list {
  display: flex;
  flex-direction: column;
  max-width: 650px;
  align-self: center;
  width: 100%;

  .plan-title {
    font-weight: bold;
    font-size: 30px;
    text-decoration-line: underline;
    color: #f7931e;

    @media only screen and (max-width: 430px) {
      font-size: 25px;
    }
  }

  .plan-container {
    background: #fcf8e3;
    border: 3px solid #f7931e;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;

    &.done {
      border-color: #50b536;
      background: rgba(203, 227, 196, 0.22);
    }

    .no-plans {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 30px 0px;
      align-self: center;

      .explanation {
        font-weight: bold;
        text-align: center;
        margin-top: 10px;
        margin-left: 50px;
        margin-right: 50px;

        &.finished {
          color: #50b536;
        }

        &.unstarted {
          color: #f7931e;
        }
      }
    }

    .show-plans {
      display: flex;
      flex-direction: column;
      padding: 10px 20px;

      .num-cameras {
        font-weight: bold;
        font-size: 20px;
        text-decoration-line: underline;
        color: #f7931e;
      }

      .plans {
        display: flex;
        font-size: 20px;
        text-decoration: none;
        color: #f7931e;
        margin-top: 5px;

        :hover {
          cursor: pointer;
        }

        .hover-container {
          display: flex;
          width: 100%;

          .plan-count {
            font-weight: bold;
            margin-left: 40px;
            width: 20%;
          }

          .plan-sub-title {
            font-weight: normal;
            width: 60%;
          }

          .pencil {
            width: 20%;
          }
        }
      }

      @media only screen and (max-width: 500px) {
        padding: 10px;
        font-size: 12px;

        .plans .hover-container {
          .plan-count {
            margin-left: 0px;
          }
        }
      }
    }
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
