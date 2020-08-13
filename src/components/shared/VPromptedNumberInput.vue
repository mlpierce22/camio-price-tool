<template lang="html">
  <div class="v-prompted-number-input">
    <div class="prompt">
      {{ inputData.prompt }}
    </div>
    <v-text-field
      v-model="fieldValue"
      background-color="#CBE3C4"
      color="#50B536"
      min="1"
      step="1"
      type="number"
      :rules="rules"
    ></v-text-field>
    <div class="units">
      {{ inputData.units }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { PromptedNumberInputObject } from "@/models";

@Component
export default class VPromptedNumberInput extends Vue {
  @Prop({ required: true }) inputData!: PromptedNumberInputObject;

  fieldValue: number;

  rules: Array<Function>;

  minRule = (val: number) => {
    if (val < 1) {
      return "You must have at least 1.";
    } else {
      return false;
    }
  };

  constructor() {
    super();
    this.fieldValue = this.inputData.initVal;
    this.rules = [
      (val: number) => (val < 1 ? "You must have at least 1." : false)
    ];
  }
}
</script>

<style scoped lang="scss">
.v-prompted-number-input {
}
</style>
