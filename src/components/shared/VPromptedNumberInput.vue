<template lang="html">
  <div class="v-prompted-number-input">
    <div class="prompt">
      {{ inputData.prompt }}
    </div>
    <div class="text-container">
      <v-text-field
        class="text-box"
        v-model="fieldValue"
        background-color="#CBE3C4"
        color="#50B536"
        min="1"
        step="1"
        type="number"
        outlined
        :hide-details="true"
        :validate-on-blur="true"
        :rules="[rules.empty, rules.min]"
      ></v-text-field>
      <div class="units">
        {{ units }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { PromptedNumberInputObject } from "@/models";
import pluralize from "pluralize";

@Component
export default class VPromptedNumberInput extends Vue {
  // TODO: add correct formatting here.
  @Prop({ required: true }) inputData!: PromptedNumberInputObject;

  fieldValue: number;

  rules: {};

  units: string;

  @Watch("fieldValue")
  handlePluralAndUpdateParent() {
    // Update Parent
    if (this.fieldValue && this.fieldValue > 0) {
      this.$emit("new-value", this.fieldValue);
    }
    // https://github.com/plurals/pluralize
    if (!this.fieldValue && this.fieldValue !== 0) {
      return this.units;
    } else if (this.fieldValue == 1) {
      this.units = pluralize.singular(this.units);
      return this.units;
    } else {
      this.units = pluralize.plural(this.units);
      return this.units;
    }
  }

  constructor() {
    super();
    this.fieldValue = this.inputData.value;
    this.units = this.inputData.units;
    this.rules = {
      empty: value => !!value || "Required.",
      min: value =>
        value >= 1 ||
        "Must have at least one " + pluralize.singular(this.units) + "."
    };
  }
}
</script>

<style scoped lang="scss">
.v-prompted-number-input {
  display: flex;
  flex-direction: column;

  .prompt {
  }

  .text-container {
    display: flex;
    align-items: center;

    ::v-deep .text-box input {
      text-align: center;
    }
    ::v-deep .v-text-field input {
      padding: 8px 0px 8px 13px;
    }

    ::v-deep .text-box .v-input__slot {
      border-radius: 10px;
      min-height: 0px;
    }

    .text-box {
      flex-grow: 0;
      max-width: 80px;

      .v-text-field >>> input {
        font-weight: 900;
        text-align: center;
      }
    }

    .units {
      padding-left: 10px;
    }
  }
}
</style>
