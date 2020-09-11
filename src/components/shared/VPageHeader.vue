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
    <div class="text-container">
      <slot name="text" class="text"></slot>
      <slot name="description" class="description"></slot>
    </div>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.v-page-header {
  display: flex;
  flex-direction: row;
  margin-bottom: 30px;

  .text-container {
    display: flex;
    flex-direction: column;
    margin-left: 15px;
    justify-content: center;

    .text {
      font-size: 45px;
      color: #f7931e;
      font-weight: bold;
    }

    .description {
      font-size: 17px;
      color: #222222;
      font-style: italic;
    }
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
