<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { AccountForm, AddOn, AddOnOpts } from "@/models";
@Component({
  components: {}
})
export default class VCheckBoxes extends Vue {
  // ---------- Props ----------
  @Prop() data!: AccountForm;

  @Prop() shouldHide!: boolean;

  // ------- Local Vars --------
  selectedBoxes: AddOn[];
  // --------- Watchers --------
  @Watch("selectedBoxes")
  boxesChanged() {
    const withRate = this.selectedBoxes.map(selection => {
      console.log(selection);
      return {
        name: selection.name,
        rate: selection.rate[1]
      };
    });
    console.log("emitting this: ", withRate);
    this.$emit("selected-changed", withRate);
  }
  // ------- Lifecycle ---------
  constructor() {
    super();
    this.selectedBoxes = this.data.selected as AddOn[];
    console.log("data here isn't good", this.data);
  }
  // --------- Methods ---------

  get checkBoxList() {
    if (this.shouldHide) {
      return (this.data.selectionOpts as AddOnOpts[]).filter(option => {
        return (
          (this.data.selected as AddOn[]).filter(addon => {
            return option.name !== addon.name;
          }).length !== 0
        );
      });
    } else {
      return this.data.selectionOpts;
    }
  }
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="v-check-boxes">
    <div class="prompt">{{ data.subPrompt }}</div>
    <v-checkbox
      v-for="(options, index) in checkBoxList"
      :key="`checkbox-${index}`"
      v-model="selectedBoxes"
      :label="options.name"
      :value="options"
      hide-details
      dense
      color="primary"
    ></v-checkbox>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.v-check-boxes {
  .prompt {
    font-weight: bold;
    text-decoration: underline;
  }
  ::v-deep .v-label {
    color: black;
  }
  .v-input--selection-controls {
    margin-top: 0px;
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
