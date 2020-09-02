<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { AccountForm, PlanTemplates, AccountSubForm } from "@/models";
import VFormItemPicker from "@/components/shared/VFormItemPicker.vue";
@Component({
  components: { VFormItemPicker }
})
export default class TheAccountPage extends Vue {
  // ---------- Props ----------
  @Prop() formData!: Array<AccountForm | AccountSubForm>;

  // ------- Local Vars --------

  formComponents: any = [];
  // --------- Watchers --------

  // ------- Lifecycle ---------
  constructor() {
    super();
  }
  // --------- Methods ---------
  changedForm(index, payload) {
    this.$emit("modify-default", {
      field: this.formData[index].fieldName,
      value: payload
    });
  }

  toggleDefault(index, payload) {
    if (payload == true) {
      this.$emit("add-default", {
        field: this.formData[index].fieldName,
        value: (this.formData[index] as AccountForm).selected
      });
    } else {
      this.$emit("remove-default", this.formData[index].fieldName);
    }
  }

  changeOverall(event) {
    this.$emit("change-overall", event);
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
        @changed-default="toggleDefault(index, $event)"
        @selected-changed="changedForm(index, $event)"
        @advanced-changed="changeOverall($event)"
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
