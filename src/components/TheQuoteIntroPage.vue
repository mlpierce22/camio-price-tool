<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { OverallData } from "@/new-models";
import { PromptedNumberInputObject, QuoteIntroForm } from "@/models";
import VPromptedNumberInput from "@/components/shared/VPromptedNumberInput.vue";
import VPageHeader from "@/components/shared/VPageHeader.vue";

@Component({
  components: { VPromptedNumberInput, VPageHeader }
})
export default class TheQuoteIntroPage extends Vue {
  // ---------- Props ----------
  @Prop() formItems!: Array<QuoteIntroForm>;

  @Prop() overall!: OverallData;
  // ------- Local Vars --------

  // --------- Watchers --------

  // ------- Lifecycle ---------
  constructor() {
    super();
  }
  // --------- Methods ---------

  get combined(): Array<PromptedNumberInputObject> {
    return this.formItems.map(item => {
      return {
        key: item.key,
        prompt: item.prompt,
        units: item.units,
        value: this.overall[item.key]
      };
    });
  }

  newValue(value, index) {
    this.$emit("change-overall", {
      key: this.combined[index].key,
      value: parseInt(value)
    });
  }
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="the-quote-intro-page" v-if="combined">
    <VPageHeader>
      <template v-slot:icon><v-icon></v-icon></template>
      <template v-slot:text><div>Intro Questions</div></template>
      <template v-slot:description>
        <!-- I have no clue why this is showing an error -->
        <div>Answer a couple of quick questions to get started!</div>
      </template>
    </VPageHeader>
    <div
      class="number-inputs"
      v-for="(value, index) in combined"
      :key="`${combined[index].key}-input`"
    >
      <VPromptedNumberInput
        :inputData="value"
        @new-value="newValue($event, index)"
      />
    </div>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.the-quote-intro-page {
  display: flex;
  flex-direction: column;
  width: 100%;

  .number-inputs {
    margin: 10px 0px;
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
