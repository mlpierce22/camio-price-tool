<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import {
  FormItem,
  AccountForm,
  TwoTierSelection,
  AccountSubForm,
  AddOn
} from "@/models";
import VYesNoSelect from "@/components/shared/form_items/VYesNoSelect.vue";
import VButtonGroup from "@/components/shared/form_items/VButtonGroup.vue";
import VButtonGroupWithSubOpts from "@/components/shared/form_items/VButtonGroupWithSubOpts.vue";
import VCheckBoxes from "@/components/shared/form_items/VCheckBoxes.vue";
import VAdvancedOptions from "@/components/shared/form_items/VAdvancedOptions.vue";

@Component({
  components: {
    VYesNoSelect,
    VButtonGroup,
    VButtonGroupWithSubOpts,
    VCheckBoxes,
    VAdvancedOptions
  }
})
export default class VFormItemPicker extends Vue {
  // ---------- Props ----------
  @Prop() public data!: AccountForm;

  // ------- Local Vars --------

  selected: any; // TODO: typing
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
  checkFormType(check) {
    return this.data.formType.includes(check);
  }

  toIndexFromString(): number {
    let index;
    (this.data.selectionOpts as string[]).forEach((option, i) => {
      if (option == this.selected) {
        index = i;
      }
    });
    return index;
  }

  fromIndexToString(payload) {
    this.selected = this.data.selectionOpts[payload];
  }
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="v-form-item-picker">
    <div class="form-item-option" v-if="checkFormType('yes-no-select')">
      <VYesNoSelect
        :data="data"
        @changed-default="$emit('changed-default', $event)"
      >
        <template v-slot:item>
          <v-select
            v-if="data.formType == 'yes-no-select-dropdown'"
            :items="data.selectionOpts"
            v-model="selected"
            :label="data.subPrompt"
            hide-details
            outlined
          ></v-select>

          <VButtonGroup
            :selectionOpts="data.selectionOpts"
            :subPrompt="data.subPrompt"
            :selected="toIndexFromString()"
            @selected-changed="fromIndexToString($event)"
            v-else-if="data.formType === 'yes-no-select-button-toggle'"
          />

          <VButtonGroupWithSubOpts
            :data="data"
            @selected-changed="selected = $event"
            v-else-if="data.formType === 'yes-no-select-multi-button-toggle'"
          />
          <VCheckBoxes
            :data="data"
            @selected-changed="selected = $event"
            v-else-if="data.formType === 'yes-no-select-checkbox'"
          />
        </template>
      </VYesNoSelect>
    </div>
    <VAdvancedOptions
      :data="data"
      @selected-changed="selected = $event"
      v-if="data.formType === 'advanced-options'"
    />
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.v-form-item-picker {
}
</style>
<!----------------- END CSS/SCSS ------------------>
