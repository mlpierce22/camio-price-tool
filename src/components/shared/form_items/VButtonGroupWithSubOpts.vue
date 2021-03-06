<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { AccountForm, TwoTierSelection, TwoTierSelectionOpts } from "@/models";
import VButtonGroup from "@/components/shared/form_items/VButtonGroup.vue";
@Component({
  components: { VButtonGroup }
})
export default class VButtonGroupWithSubOpts extends Vue {
  // ---------- Props ----------
  @Prop() data!: AccountForm;

  // ------- Local Vars --------

  topLevelKey: string;

  // --------- Watchers --------

  @Watch("topLevelKey")
  topLevelKeyChange() {
    console.log("Change to the top level key, it is now: " + this.topLevelKey);
    this.constructSelected(this.subSelectedIndex);
  }
  // ------- Lifecycle ---------
  constructor() {
    super();
    this.topLevelKey = (this.data.selected as TwoTierSelection).type;
  }
  // --------- Methods ---------
  /** Gets the option keys to display at the top level. */
  get topLevelOpts() {
    return Object.keys(this.data.selectionOpts);
  }

  /** Converts the selected top level "type" into an index for the button component.  */
  get selectedIndex() {
    let index = NaN;
    Object.keys(this.data.selectionOpts).forEach((key, idx) => {
      if ((this.data.selected as TwoTierSelection).type == key) {
        index = idx;
        return;
      }
    });
    return index;
  }

  /** Converts the selected "option" from a string into an index for the button component. */
  get subSelectedIndex() {
    let index = NaN;
    this.data.selectionOpts[this.topLevelKey].forEach((subItem, idx) => {
      if ((this.data.selected as TwoTierSelection).option == subItem) {
        index = idx;
        return;
      }
    });
    if (!index) {
      // Fallback to the 2nd item
      index = 1;
    }
    return index;
  }

  /** Gets the sub options array based on a key. */
  get subOpts() {
    return this.data.selectionOpts[this.topLevelKey];
  }

  /** Helper function to make the index we get from the button component into the corresponding key */
  convertIndexToKey(index) {
    this.topLevelKey = Object.keys(this.data.selectionOpts)[index];
  }

  /** Converts an index from the sub button into a string value. */
  convertIndexToValue(index): string {
    return this.data.selectionOpts[this.topLevelKey][index];
  }

  /** Constructs and emits the object to change the account data. */
  constructSelected(subIndex) {
    const bottomOption = this.convertIndexToValue(subIndex);
    console.log(
      `constructing object like { type:${this.topLevelKey}, option:${bottomOption} }`
    );
    this.$emit("selected-changed", {
      type: this.topLevelKey,
      option: bottomOption
    });
  }

  /** Get a subsub prompt if it exists. */
  get subSubPrompt() {
    return this.data["subSubPrompts"]
      ? this.data.subSubPrompts[this.topLevelKey]
      : "";
  }
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="v-button-group-with-sub-opts">
    <VButtonGroup
      :selectionOpts="topLevelOpts"
      :subPrompt="data.subPrompt"
      :selected="selectedIndex"
      @selected-changed="convertIndexToKey($event)"
    />
    <div class="sub-container" v-if="topLevelKey">
      <VButtonGroup
        :key="`${selectedIndex}-subopts`"
        :selectionOpts="subOpts"
        :selected="subSelectedIndex"
        :subPrompt="subSubPrompt"
        @selected-changed="constructSelected($event)"
      />
    </div>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.v-button-group-with-sub-opts {
  display: flex;
  flex-direction: column;

  .sub-container {
    display: flex;
    border: 2px solid #f7931e;
    padding: 33px 20px 10px 25px;
    margin: -24px 0px 0px 17px;
    border-radius: 10px;

    @media only screen and (max-width: 780px) {
      border: none;
      padding: 0;
      margin: 0px;
      margin-top: 14px;
    }
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
