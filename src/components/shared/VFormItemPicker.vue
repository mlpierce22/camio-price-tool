<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { FormItem, AccountForm } from "@/models";
import VBackNextButton from "./VBackNextButton.vue";
import VYesNoSelect from "./form_items/VYesNoSelect.vue";

@Component({
  components: {
    VYesNoSelect
  }
})
export default class VFormItemPicker extends Vue {
  // ---------- Props ----------
  @Prop() data!: AccountForm;

  // ------- Local Vars --------

  // --------- Watchers --------

  // ------- Lifecycle ---------
  constructor() {
    super();
    console.log(this.data);
  }
  // --------- Methods ---------
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="v-form-item-picker">
    <!-- TODO: remove extra existence check -->
    <div
      class="form-item-option"
      v-if="this.data.formType == 'yes-no-select-dropdown'"
    >
      <VYesNoSelect></VYesNoSelect>
    </div>
    <div
      class="form-item-option"
      v-else-if="this.data.formType == 'yes-no-select-button-toggle'"
    >
      <VYesNoSelect></VYesNoSelect>
    </div>
    <div
      class="form-item-option"
      v-else-if="this.data.formType == 'yes-no-select-checkbox'"
    >
      <VYesNoSelect></VYesNoSelect>
    </div>
    <div
      class="form-item-option"
      v-else-if="this.data.formType == 'yes-no-select-multi-button-toggle'"
    >
      <VYesNoSelect></VYesNoSelect>
    </div>
    <div
      class="form-item-option"
      v-else-if="this.data.formType == 'advanced-options'"
    >
      Showing hidden options
    </div>
    <div
      class="form-item-option"
      v-else-if="this.data.formType == 'advanced-options'"
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
