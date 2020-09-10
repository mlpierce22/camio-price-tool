<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
@Component({
  components: {}
})
export default class VPageHeader extends Vue {
  // ---------- Props ----------

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
  <div class="v-page-header">
    <slot name="icon"></slot>
    <slot name="text"></slot>
    <slot name="description"></slot>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.v-page-header {
}
</style>
<!----------------- END CSS/SCSS ------------------>
