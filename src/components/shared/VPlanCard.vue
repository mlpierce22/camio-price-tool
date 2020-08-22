<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { PlanTemplateWithDefaults } from "@/models";
import { filter } from "vue/types/umd";
@Component({
  components: {}
})
export default class VPlanCard extends Vue {
  // ---------- Props ----------
  @Prop() planTemplate!: PlanTemplateWithDefaults[];

  @Prop() title!: string;
  // ------- Local Vars --------

  // --------- Watchers --------

  // ------- Lifecycle ---------
  constructor() {
    super();
    console.log("plan template def: ", this.planTemplate);
  }
  // --------- Methods ---------

  // TODO: Why isnt this working right??
  getPlans() {
    return this.planTemplate.flatMap(field => {
      console.log("field:", field);
      if (field["isDefault"] && !field.isDefault) {
        console.log("yay! default exists");
        if (typeof field.selected == "string") {
          return field;
        } else if (typeof field.selected == "object") {
          return field.selected["type"];
        } else if (Array.isArray(field.selected)) {
          return (field.selected as []).map(opts => opts["name"]);
        }
      } else {
        console.log("field is not default", field);
      }
    });
  }
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="v-plan-card">
    <div class="card">
      <div class="title">{{ title }}</div>
      <div class="subtitle"><i>Includes</i></div>
      <div class="list">
        <div
          class="feature-container"
          v-for="(planAttrib, index) in getPlans()"
          :key="`${index}-plan-attrib-${title}`"
        >
          <div class="feature" v-if="!planAttrib.isDefault">
            <v-icon color="secondary" size="18">mdi-checkbox-marked</v-icon>
            <span class="label">{{ planAttrib.label }}</span>
          </div>
        </div>
      </div>
      <v-btn class="create-btn" depressed color="primary"
        >Create from plan</v-btn
      >
    </div>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.v-plan-card {
  margin: 3vh 0vw;

  &.margins {
    margin-right: 3vw;
    @media only screen and (max-width: 938px) {
      margin-right: 20px;
    }
    @media only screen and (max-width: 500px) {
      margin: 0px;
    }
  }
  @media only screen and (max-width: 938px) {
    margin: 20px;
  }

  .card {
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border: 3px solid #f7931e;
    box-sizing: border-box;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 10px;
    max-width: 350px;
    padding: 30px;

    @media only screen and (max-width: 500px) {
      padding: 10px;
    }

    .title {
      color: #f7931e;
      font-weight: bold;
    }

    .list {
      display: flex;
      flex-direction: column;
      margin-left: 25px;
      margin-bottom: 15px;

      @media only screen and (max-width: 700px) {
        margin-left: 0px;
      }
    }

    ::v-deep .v-btn__content {
      @media only screen and (max-width: 500px) {
        font-size: 0.675rem;
      }

      @media only screen and (max-width: 380px) {
        font-size: 0.58rem;
      }
    }
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
