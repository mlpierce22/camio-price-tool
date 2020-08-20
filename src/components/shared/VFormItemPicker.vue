<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { FormItem, AccountForm, Indexing, AccountSubForm } from "@/models";
import VYesNoSelect from "@/components/shared/form_items/VYesNoSelect.vue";
import VButtonGroup from "@/components/shared/form_items/VButtonGroup.vue";

@Component({
  components: {
    VYesNoSelect,
    VButtonGroup
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

  toIndex() {
    let index;
    this.data.selectionOpts.forEach((option, i) => {
      if (option == this.selected) {
        index = i;
      }
    });
    return index;
  }

  fromIndex(payload) {
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
        <!-- <template v-slot:subPrompt>{{ data.subPrompt }}</template> -->
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
            :data="data"
            :selected="toIndex()"
            @selected-changed="fromIndex($event)"
            v-else-if="data.formType === 'yes-no-select-button-toggle'"
          />

          <!-- <VButtonGroup
            :data="data"
            :hasSubOpts="true"
            :selected="toIndex()"
            @selected-changed="fromIndex($event)"
            v-else-if="data.formType === 'yes-no-select-multi-button-toggle'"
          /> -->
        </template>
      </VYesNoSelect>
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