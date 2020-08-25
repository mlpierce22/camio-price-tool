<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { FullFilteredPlan } from "@/models";
@Component({
  components: {}
})
export default class VTextInput extends Vue {
  // ---------- Props ----------
  @Prop() data!: FullFilteredPlan;

  // ------- Local Vars --------
  inputValue: string;

  counter = 50;

  rules = {
    empty: value => !!value || "Required.",
    max: v => v.length <= this.counter || `Max ${this.counter} characters`
    // TODO: Add exists rule! (here and in template)
    // exists: value => {
    //   this.$root.$data["plans"];
    // }
  };
  // --------- Watchers --------
  @Watch("inputValue")
  inputChanged() {
    this.$emit("input-changed", this.inputValue);
  }
  // ------- Lifecycle ---------
  constructor() {
    super();
    this.inputValue = this.data.selected as string;
  }
  // --------- Methods ---------
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="v-text-input">
    <div class="prompt">
      {{ data.prompt }}
    </div>
    <v-text-field
      class="text-box"
      v-model="inputValue"
      background-color="#CBE3C4"
      color="#50B536"
      :counter="counter"
      outlined
      :validate-on-blur="true"
      :rules="[rules.empty, rules.max]"
    ></v-text-field>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.v-text-input {
  ::v-deep .text-box {
    max-width: 250px;
    margin-bottom: -20px;
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
