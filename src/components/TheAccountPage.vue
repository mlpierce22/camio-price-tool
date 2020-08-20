<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { AccountForm, PlanTemplates } from "@/models";
import VFormItemPicker from "@/components/shared/VFormItemPicker.vue";
@Component({
  components: { VFormItemPicker }
})
export default class TheAccountPage extends Vue {
  // ---------- Props ----------
  @Prop() formData!: Array<AccountForm>;

  // ------- Local Vars --------

  formComponents: any = [];
  // --------- Watchers --------

  // ------- Lifecycle ---------
  constructor() {
    super();
    console.log(this.formData);
  }
  // --------- Methods ---------
  changedForm(index, fieldChanged, event) {
    this.$emit("changed-form-item", { index, fieldChanged, payload: event });
    console.log(
      "Changed form on the event page. The event is:",
      event,
      `At index ${index} with item,`,
      fieldChanged
    );
  }
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="the-account-page">
    <div
      v-for="(formItem, index) in formData"
      :key="`${index}-form-item`"
      class="form-item"
    >
      <VFormItemPicker
        :data="formItem"
        @changed-default="changedForm(index, 'isDefault', $event)"
        @selected-changed="changedForm(index, 'selected', $event)"
      />
    </div>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.the-account-page {
}
</style>
<!----------------- END CSS/SCSS ------------------>
