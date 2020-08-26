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
  selectedBoxes: boolean[] = [];

  filteredBoxes: Array<{ name: string; rate: boolean }> = [];

  // --------- Watchers --------

  @Watch("selectedBoxes")
  selectedChanged() {
    console.log("rate:", this.selectedBoxes);

    this.$emit(
      "selected-changed",
      this.filteredBoxes
        .map((item, index) => {
          return {
            name: item.name,
            rate: this.convertRate(this.selectedBoxes[index]) as number
          };
        })
        .concat(
          (this.data.selected as AddOn[]).map(selected => {
            return {
              name: selected.name,
              rate: selected.rate
            };
          })
        )
        .filter(option => {
          return option.rate !== 0;
        })
    );
  }
  // ------- Lifecycle ---------

  // TODO:
  /** Need to come back to this because it has a difficult functionality to handle:
   * We want this component to take the incoming selected data and get rid of entries that contain it (but only the first time, because it is updated in the parent and we would get a problem where checkboxes cancel out as you click them)
   * This logic should probably be handled in the parent - where though??
   *
   */
  constructor() {
    super();
    if (this.shouldHide && this.data.isDefault) {
      // create an object that is the selection options
      const selectedNames = (this.data.selected as AddOn[]).map(
        selected => selected.name
      );
      const selectedRates = (this.data.selected as AddOn[]).map(
        selected => selected.rate
      );
      console.log("names n rates", selectedNames, selectedRates);
      this.filteredBoxes = (this.data.selectionOpts as AddOnOpts[])
        .map((option, index) => {
          console.log(
            selectedRates.length - 1,
            "is >=?",
            index,
            selectedRates.length - 1 >= index,
            "the value here is: ",
            selectedRates[index]
          );
          return {
            name: option.name,
            rate:
              selectedRates.length - 1 >= index
                ? (this.convertRate(selectedRates[index]) as boolean)
                : (this.convertRate(0) as boolean)
          };
        })
        .filter(option => {
          return !selectedNames.includes(option.name);
        });
    } else {
      // make it so the rate is 0 and all display
      this.filteredBoxes = (this.data.selectionOpts as AddOnOpts[]).map(
        option => {
          return {
            name: option.name,
            rate: this.convertRate(0) as boolean
          };
        }
      );
    }
    this.selectedBoxes = this.filteredBoxes.map(box => {
      return box.rate;
    });
  }

  // --------- Methods ---------

  convertRate(rate: boolean | number) {
    if (typeof rate == "number") {
      console.log(
        "converting number, " + rate + " to ",
        rate == 0 ? false : true
      );
      return rate == 0 ? false : true;
    } else {
      console.log("converting boolean, " + rate + " to ", rate ? 100 : 0);
      return rate ? 100 : 0;
    }
  }

  get checkBoxList() {
    return this.filteredBoxes;
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
      v-model="selectedBoxes[index]"
      :label="options.name"
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
