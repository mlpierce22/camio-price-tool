<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { PlanTemplates, AccountForm, AccountSubForm } from "@/models";
@Component({
  components: {}
})
export default class TheCreatePlansPage extends Vue {
  // ---------- Props ----------
  @Prop() planTemplates!: PlanTemplates;

  @Prop() formOptions!: any; // TODO: is this worth typing??

  @Prop() accountData!: Array<AccountForm | AccountSubForm>;
  // ------- Local Vars --------

  // --------- Watchers --------

  // ------- Lifecycle ---------
  constructor() {
    super();
  }
  // --------- Methods ---------
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="the-create-plans-page">
    <h1>the-create-plans-page component works!</h1>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.the-create-plans-page {
}
</style>
<!----------------- END CSS/SCSS ------------------>
