<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { FormItem, AccountForm, Indexing, AccountSubForm } from "@/models";
import VBackNextButton from "./VBackNextButton.vue";
import VYesNoSelect from "./form_items/VYesNoSelect.vue";

@Component({
  components: {
    VYesNoSelect
  }
})
export default class VFormItemPicker extends Vue {
  // ---------- Props ----------
  @Prop() public data!: AccountForm;

  // ------- Local Vars --------

  selected: string | string[] | Indexing | AccountSubForm[];
  // --------- Watchers --------

  @Watch("selected")
  selectedChanged() {
    this.$emit("selected-changed", this.selected);
  }

  // ------- Lifecycle ---------
  constructor() {
    super();
    console.log(this.data);
    this.selected = this.data.selected;
  }
  // --------- Methods ---------
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="v-form-item-picker">
    <div
      class="form-item-option"
      v-if="data.formType == 'yes-no-select-dropdown'"
    >
      <VYesNoSelect
        :data="data"
        @changed-default="$emit('changed-default', $event)"
      >
        <!-- <template v-slot:subPrompt>{{ data.subPrompt }}</template> -->
        <template v-slot:item>
          <v-select
            :items="data.selectionOpts"
            v-model="selected"
            :label="data.subPrompt"
            hide-details
            outlined
          ></v-select>
        </template>
      </VYesNoSelect>
    </div>
    <div
      class="form-item-option"
      v-else-if="data.formType == 'yes-no-select-button-toggle'"
    >
      <VYesNoSelect :data="data"></VYesNoSelect>
    </div>
    <div
      class="form-item-option"
      v-else-if="data.formType == 'yes-no-select-checkbox'"
    >
      <VYesNoSelect :data="data"></VYesNoSelect>
    </div>
    <div
      class="form-item-option"
      v-else-if="data.formType == 'yes-no-select-multi-button-toggle'"
    >
      <VYesNoSelect :data="data"></VYesNoSelect>
    </div>
    <div
      class="form-item-option"
      v-else-if="data.formType == 'advanced-options'"
    >
      Showing hidden options
    </div>
    <div
      class="form-item-option"
      v-else-if="data.formType == 'advanced-options'"
    >
      Showing dropdown of options
    </div>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.v-form-item-picker {
}
</style>
<!----------------- END CSS/SCSS ------------------>
