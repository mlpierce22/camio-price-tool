<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { AccountForm, TwoTierSelection, AccountSubForm } from "@/models";
@Component({
  components: {}
})
export default class VButtonGroup extends Vue {
  // ---------- Props ----------
  @Prop() selectionOpts!: string[];

  @Prop() subPrompt!: string;

  @Prop() selected!: number;

  // ------- Local Vars --------

  selectedLocal: number;
  // --------- Watchers --------

  @Watch("selectedLocal")
  selectedChanged() {
    this.$emit("selected-changed", this.selectedLocal);
  }
  // ------- Lifecycle ---------
  constructor() {
    super();
    this.selectedLocal = this.selected;
  }
  // --------- Methods ---------
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="v-button-group">
    <div class="sub-prompt">{{ subPrompt }}</div>
    <v-btn-toggle
      v-model="selectedLocal"
      :mandatory="true"
      color="primary"
      :rounded="true"
      active-class="active"
    >
      <v-btn
        v-for="(option, index) in selectionOpts"
        :key="`${index}-button-group-item`"
      >
        <div class="btn-text">{{ option }}</div>
      </v-btn>
    </v-btn-toggle>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.v-button-group {
  display: flex;
  flex-direction: column;

  @media only screen and (max-width: 780px) {
    align-items: center;
  }

  .sub-prompt {
    margin-bottom: 10px;
    font-style: italic;
  }

  ::v-deep .v-btn-toggle {
    background: none !important;

    .v-btn.v-btn {
      opacity: 1;

      &.v-size--default {
        border: solid 3px;
        border-color: #f7931e !important;
        margin: -1.5px;
        background-color: white;
        color: #f7931e;
        font-weight: bold;
      }
      &.active {
        background: #f7931e !important;
        color: white;

        &::before {
          opacity: 0;
        }
      }
    }
    @media only screen and (max-width: 780px) {
      display: flex;
      flex-direction: column;
      width: 150px;

      .v-btn.v-btn.v-btn {
        padding: 0px 40px;
        @media only screen and (max-width: 350px) {
          padding: 0px;
        }
      }

      .v-btn.v-btn:first-child {
        border-top-left-radius: inherit;
        border-bottom-left-radius: 0px;
        border-top-right-radius: inherit;
        border-bottom-right-radius: 0px;
      }
      .v-btn.v-btn:last-child {
        border-top-left-radius: 0px;
        border-bottom-left-radius: inherit;
        border-top-right-radius: 0px;
        border-bottom-right-radius: inherit;
      }
    }
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
