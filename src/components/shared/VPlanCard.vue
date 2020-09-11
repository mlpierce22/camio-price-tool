<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { PlanTemplateWithDefaults, AddOn } from "@/models";
import { filter } from "vue/types/umd";
import { DefaultMap } from "@/new-models";
@Component({
  components: {}
})
export default class VPlanCard extends Vue {
  // ---------- Props ----------
  @Prop() planTemplate!: PlanTemplateWithDefaults[];

  @Prop() title!: string;

  @Prop() defaults!: DefaultMap;
  // ------- Local Vars --------

  // --------- Watchers --------

  // ------- Lifecycle ---------
  constructor() {
    super();
  }
  // --------- Methods ---------

  get plansFlattened() {
    return this.planTemplate
      .flatMap(field => {
        if (!this.defaults[field.fieldName]) {
          if (typeof field.selected == "string") {
            return field.label + ": " + field.selected;
          } else if (Array.isArray(field.selected)) {
            return field.selected.length == 0
              ? undefined
              : field.label +
                  ": " +
                  (field.selected as []).map(opts =>
                    opts["name"] ? opts["name"] : opts
                  );
          } else if (typeof field.selected == "object") {
            return field.label + ": " + field.selected["type"];
          }
        } else {
          if (Array.isArray(field.selected)) {
            const filtered = (field.selected as AddOn[]).filter(
              option => !this.defaults[field.fieldName].includes(option.name)
            );
            return filtered.length == 0
              ? undefined
              : field.label +
                  ": " +
                  (field.selected as []).map(opts =>
                    opts["name"] ? opts["name"] : opts
                  );
          } else {
            return undefined;
          }
        }
      })
      .filter(label => label);
  }
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="v-plan-card">
    <div class="card">
      <div class="title">{{ title }}</div>
      <div class="subtitle" v-if="plansFlattened.length > 0">
        <i>Includes</i>
      </div>
      <div class="list">
        <div class="feature" v-if="plansFlattened.length == 0">
          All defaults already selected.
        </div>
        <div class="feature" v-if="plansFlattened.length == 0">
          Choose a plan to add cameras and a name.
        </div>
        <div
          class="feature-container"
          v-for="(plan, index) in plansFlattened"
          :key="`${index}-plan-attrib-${title}`"
        >
          <div class="feature">
            <v-icon color="secondary" size="18">mdi-checkbox-marked</v-icon>
            <span class="label">{{ plan }}</span>
          </div>
        </div>
      </div>
      <v-btn
        class="create-btn"
        depressed
        color="primary"
        @click.stop="$emit('create-plan', title)"
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
    @media only screen and (max-width: 961px) {
      margin-right: 10px;
      margin-left: 5px;
      @media only screen and (max-width: 500px) {
        margin-left: 3vw;
      }
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
    max-width: 300px;
    padding: 30px;
    min-height: 300px;
    min-width: 300px;

    @media only screen and (max-width: 500px) {
      padding: 10px;
      min-width: 206px;
      min-height: 240px;

      @media only screen and (max-width: 390px) {
        min-width: 206px;
        max-width: 160px;
      }
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
      font-size: 14px;

      .feature {
        display: flex;
        align-items: center;

        .label {
          margin-left: 5px;
          text-overflow: wrap;
        }
      }

      @media only screen and (max-width: 700px) {
        margin-left: 0px;

        @media only screen and (max-width: 500px) {
          font-size: 12px;
        }
      }
    }
    .create-btn {
      margin-top: auto;
    }
    ::v-deep .v-btn__content {
      @media only screen and (max-width: 500px) {
        font-size: 0.75rem;
      }
    }
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
