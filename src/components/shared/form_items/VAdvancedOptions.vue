<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { AccountSubForm } from "@/models";
@Component({
  components: {}
})
export default class VAdvancedOptions extends Vue {
  // ---------- Props ----------
  @Prop() data!: AccountSubForm;

  // ------- Local Vars --------

  selected: string[] = [];

  isOpen = [];

  // --------- Watchers --------

  @Watch("selected")
  selectedChanged(event) {
    const tempSubform = this.data.subForm.map((form, index) => {
      return {
        key: form.fieldName,
        value: event[index]
      };
    });
    tempSubform.forEach(formItem => this.$emit("advanced-changed", formItem));
  }
  // ------- Lifecycle ---------
  constructor() {
    super();
    this.selected = this.data.subForm.map(option => {
      return option.selected as string;
    });
  }
  // --------- Methods ---------
  get checkifOpen() {
    return this.isOpen.length > 0;
  }

  get subOpts() {
    return this.data.subForm.map(option => {
      return (option.selectionOpts as []).map(opt => {
        return opt;
      });
    });
  }
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="v-advanced-options">
    <v-expansion-panels
      v-model="isOpen"
      :class="{ open: checkifOpen }"
      flat
      hover
      multiple
      color="secondary"
    >
      <v-expansion-panel>
        <v-expansion-panel-header ripple class="advanced-opts-label">
          <span class="text" :class="{ open: checkifOpen }"
            >Advanced Options</span
          >
          <template v-slot:actions>
            <v-icon color="secondary">mdi-menu-down</v-icon>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <div class="advanced-option-container">
            <div
              class="advanced-option"
              v-for="(option, index) in data.subForm"
              :key="`${index}-advanced-option`"
            >
              <v-select
                :items="subOpts[index]"
                v-model="selected[index]"
                :label="option.prompt"
                hide-details
                outlined
              ></v-select>
            </div>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.v-advanced-options {
  ::v-deep .v-expansion-panels {
    border: 3px solid #50b536;
    border-radius: 10px;
    max-width: 225px;

    &.open {
      max-width: 600px;
    }

    .v-expansion-panel {
      .advanced-opts-label {
        color: #50b536 !important;

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
        @media only screen and (max-width: 450px) {
          display: none;
        }
      }
      .v-expansion-panel-content__wrap {
        @media only screen and (max-width: 450px) {
          padding-left: 10px;
          padding-right: 10px;
          padding-top: 0px;
        }

        .advanced-option-container {
          display: flex;
          flex-direction: column;
          margin: 5px;

          .advanced-option {
            margin-top: 20px;
          }
        }
      }
    }
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
