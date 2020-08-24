<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import {
  PlanTemplates,
  AccountSubForm,
  AccountForm,
  FullFilteredPlan
} from "@/models";
import VBackNextButton from "@/components/shared/VBackNextButton.vue";
import VFormItemPicker from "@/components/shared/VFormItemPicker.vue";

@Component({
  components: {
    VBackNextButton,
    VFormItemPicker
  }
})
export default class TheCreatePlansModal extends Vue {
  // ---------- Props ----------
  @Prop() dialog!: boolean;

  @Prop() planData!: FullFilteredPlan;

  @Prop() isVertical!: boolean;
  // ------- Local Vars --------

  dialogOpen!: boolean;

  // --------- Watchers --------
  @Watch("dialogOpen")
  dialogClosed() {
    this.$emit("dialog-closed");
  }

  @Watch("dialog")
  dialogChange($event) {
    if ($event) {
      this.dialogOpen = this.dialog;
    }
  }

  constructor() {
    // ------- Lifecycle ---------
    super();
    this.dialogOpen = this.dialog;
  }
  // --------- Methods ---------
  changedForm(index, fieldChanged, event) {
    this.$emit("changed-form-item", { index, fieldChanged, payload: event });
  }

  submit() {
    this.$emit("dialog-closed", true);
  }
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="the-create-plans-modal">
    <v-dialog
      v-model="dialogOpen"
      :fullscreen="isVertical"
      persistent
      max-width="1200"
    >
      <v-card class="modal">
        <div
          v-for="(planItem, index) in planData"
          :key="`${index}-form-item`"
          class="form-item"
        >
          <div
            class="top-form"
            v-if="planItem.fieldName !== 'resolution'"
            key="notResolution"
          >
            <VFormItemPicker
              :data="planItem"
              @selected-changed="changedForm(index, 'selected', $event)"
            />
          </div>
          <div class="bottom-form" v-else key="resolution">
            Bottom form
          </div>
        </div>
        Yaya!
        <!-- <v-card-title class="headline"
          >Use Google's location service?</v-card-title
        >
        <v-card-text
          >Let Google help apps determine location. This means sending anonymous
          location data to Google, even when no apps are running.</v-card-text
        >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="dialog = false"
            >Disagree</v-btn
          >
          <v-btn color="green darken-1" text @click="dialog = false"
            >Agree</v-btn
          >
        </v-card-actions> -->
        <VBackNextButton
          @next-click="submit()"
          @back-click="dialogOpen = false"
          next="Create Plan"
          back="Cancel"
        />
      </v-card>
    </v-dialog>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.the-create-plans-modal {
}
</style>
<!----------------- END CSS/SCSS ------------------>
