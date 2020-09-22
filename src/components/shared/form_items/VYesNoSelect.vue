<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { AccountForm, AccountSubForm } from "@/models";
@Component({
  components: {}
})
export default class VYesNoSelect extends Vue {
  // ---------- Props ----------
  @Prop() data!: AccountForm;

  @Prop() dataInDefault!: boolean;
  // ------- Local Vars --------

  isDefault: boolean;
  // --------- Watchers --------

  @Watch("isDefault")
  changeDefault() {
    this.$emit("changed-default", this.isDefault);
  }

  @Watch("dataInDefault")
  changeStatus() {
    this.isDefault = this.dataInDefault;
  }
  // ------- Lifecycle ---------
  constructor() {
    super();
    this.isDefault = this.dataInDefault;
  }
  // --------- Methods ---------
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="v-yes-no-select">
    <div class="prompt">
      {{ data.prompt }}
    </div>
    <v-radio-group v-model="isDefault" :hide-details="true" row>
      <v-radio label="Yes" :value="true"></v-radio>
      <v-radio label="No" :value="false"></v-radio>
    </v-radio-group>
    <v-expand-transition>
      <div class="sub-container" v-if="isDefault">
        <slot name="item"></slot>
      </div>
    </v-expand-transition>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.v-yes-no-select {
  display: flex;
  flex-direction: column;
  padding-left: 10px;
  //margin-bottom: 30px;

  .v-input--selection-controls {
    margin-top: 0px;
  }

  .v-input {
    width: fit-content;
    background: white;
    z-index: 1;
  }

  .prompt {
    font-weight: bold;
  }

  .sub-container {
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    padding: 16px 20px 10px 25px;
    margin: -12px 0px 0px 10px;
    max-width: 600px;
    border: 2px solid orange;

    @media only screen and (max-width: 665px) {
      margin: 10px 0px 0px -10px;
    }

    @media only screen and (max-width: 500px) {
      align-items: center;
    }
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
