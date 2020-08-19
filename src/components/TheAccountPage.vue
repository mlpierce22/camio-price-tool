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
      <VFormItemPicker :data="formItem" />
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
