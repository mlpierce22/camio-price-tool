<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { AccountForm, Indexing, AccountSubForm } from "@/models";
@Component({
  components: {}
})
export default class VButtonGroup extends Vue {
  // ---------- Props ----------
  @Prop() data!: AccountForm;

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
    <slot></slot>
    <div class="sub-prompt">{{ data.subPrompt }}</div>
    <v-btn-toggle
      v-model="selectedLocal"
      :mandatory="true"
      color="primary"
      :rounded="true"
      active-class="active"
    >
      <v-btn
        v-for="(option, index) in data.selectionOpts"
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

  .sub-prompt {
    margin-bottom: 10px;
  }

  ::v-deep .v-btn-toggle {
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
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
