<template lang="html">
  <div class="the-quote-intro-page">
    <div class="number-inputs" v-for="(value, key) in formData" :key="key">
      <VPromptedNumberInput
        :inputData="value"
        @new-value="newValue($event, key)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { QuoteIntroForm } from "@/models";
import VPromptedNumberInput from "@/components/shared/VPromptedNumberInput.vue";

@Component({
  components: {
    VPromptedNumberInput
  }
})
export default class TheQuoteIntroPage extends Vue {
  @Prop({ required: true })
  private formData!: QuoteIntroForm;

  newValue(newVal, key) {
    this.$emit("new-value-keyed", { newVal, key });
  }
}
</script>

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
