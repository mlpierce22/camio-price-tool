<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { AccountForm } from "@/models";
@Component({
  components: {}
})
export default class TheAccountPage extends Vue {
  // ---------- Props ----------
  @Prop() formData!: Array<AccountForm>;

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
  <div class="the-account-page">
    <h1>the-account-page component works!</h1>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.the-account-page {
}
</style>
<!----------------- END CSS/SCSS ------------------>
