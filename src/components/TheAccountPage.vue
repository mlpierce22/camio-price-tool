<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { AccountForm, PlanTemplates, AccountSubForm } from "@/models";
import VPageHeader from "@/components/shared/VPageHeader.vue";
import VFormItemPicker from "@/components/shared/VFormItemPicker.vue";
import { DefaultMap } from "@/new-models";

@Component({
  components: { VFormItemPicker, VPageHeader }
})
export default class TheAccountPage extends Vue {
  // ---------- Props ----------
  @Prop() formData!: Array<AccountForm | AccountSubForm>;

  @Prop() defaults!: DefaultMap;

  // ------- Local Vars --------

  formComponents: any = [];
  // --------- Watchers --------

  // ------- Lifecycle ---------
  constructor() {
    super();
    // Automatically set all defaults to true.
    this.formData
      .filter(formField => formField.fieldName !== "advancedOptions")
      .forEach(field => {
        this.$emit("add-default", {
          field: field.fieldName,
          value: (field as AccountForm).selected
        });
      });
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
    <VPageHeader>
      <template v-slot:icon
        ><v-icon color="primary" size="90"
          >mdi-account-multiple
        </v-icon></template
      >
      <template v-slot:text><div class="text">Account-Wide</div></template>
      <template v-slot:description>
        <div class="description">
          Apply these options across all cameras.
        </div>
      </template>
    </VPageHeader>
    <div
      v-for="(formItem, index) in formData"
      :key="`${index}-form-item`"
      class="form-item"
    >
      <VFormItemPicker
        :data="formItem"
        :defaults="defaults"
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
  display: flex;
  flex-direction: column;
}
</style>
<!----------------- END CSS/SCSS ------------------>
