<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { FinalYAMLObject, LocationAttributes } from "@/new-models";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
@Component({
  components: {},
  filters: {
    formatMoney(amountCents) {
      const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2
      });
      return formatter.format(amountCents / 100);
    }
  }
})
export default class TheEstimatePage extends Vue {
  // ---------- Props ----------
  @Prop() finalYAMLObject!: FinalYAMLObject;

  // TODO: type
  @Prop() pricing!: {};

  @Prop() mpMapping!: {};
  // ------- Local Vars --------

  // --------- Watchers --------

  @Watch("finalYAMLObject", { deep: true })
  attributeChange() {
    console.log("yaml updated!");
    const price = this.prices;
    console.log("recalculated price", price);
  }
  // ------- Lifecycle ---------
  constructor() {
    super();
  }
  // --------- Methods ---------

  toNumberWithUnits(stringToConvert: string) {
    const split = stringToConvert.split(/([0-9]+)/).filter(Boolean);
    return {
      number: parseInt(split[0]),
      units: split[1]
    };
  }

  estimateVideoBytesMonthly(
    estimatedEventsUploaded: number,
    hoursOfMotion: number,
    bitrate: number
  ) {
    // the percent motion as decimal times 1 day (24 hrs) = number hours active per day
    // events uploaded is the number of hours active (converted to seconds)/(length of an event in seconds)
    // (events uploaded * the duration of an event in seconds * the bitrate * size of a kilobit (why?))
    const eventSeconds = this.pricing["location"]["plan"]["cloudData"]
      .EVENT_DURATION_SECONDS;
    const kilobits = this.pricing["location"]["plan"]["cloudData"].KILOBITS;
    return (
      ((estimatedEventsUploaded * eventSeconds * bitrate * kilobits) / 8) * 30.5
    );
  }

  estimateBitRate(cameraMotionPercent: number, resolution: string) {
    console.log("the rez", resolution);
    const initialBitrate = this.mpMapping[resolution].bitrate || 2048;
    return Math.round(cameraMotionPercent * initialBitrate);
  }

  getEstimatedSaasPrice(
    estimatedEventsUploaded: number,
    hoursOfMotion: number,
    percentMotion: number,
    bitrate: number,
    cloudStorage: number
  ) {
    const cloudStorageCost = this.pricing["location"]["plan"]["cloudData"]
      .PRICE_GCS_PER_BYTE_PER_MONTH_CENTS;
    const eventWriteCost = this.pricing["location"]["plan"]["cloudData"]
      .PRICE_PER_EVENT_WRITTEN_STORED_PER_MONTH_CENTS;
    const videoPriceCents =
      this.estimateVideoBytesMonthly(
        estimatedEventsUploaded,
        hoursOfMotion,
        bitrate
      ) * cloudStorageCost;
    const eventPriceCents = estimatedEventsUploaded * 30.5 * eventWriteCost;
    const storageAsMonth = cloudStorage / 30;
    return storageAsMonth * (videoPriceCents + eventPriceCents);
  }

  normalizeStreams(numStreamsOfCertainResolution, mpOfThoseStreams) {
    console.log("stream", numStreamsOfCertainResolution, mpOfThoseStreams);
    return numStreamsOfCertainResolution * ((mpOfThoseStreams / 2) ^ (2 / 3));
  }

  deNormalizeStreams(amtOf2MPStreams, mpOfDesiredStream) {
    return amtOf2MPStreams / ((mpOfDesiredStream / 2) ^ (2 / 3));
  }

  get prices() {
    const overall = this.finalYAMLObject.overall;
    const overallPricing = Object.keys(overall)
      .filter(key => key !== "totalLocations" && key !== "totalCameras")
      .map(globalOption => {
        return {
          key: globalOption,
          price:
            this.pricing["account wide"][globalOption][overall[globalOption]] *
            overall["totalCameras"]
        };
      });

    const pricingPerLocation = Object.keys(this.finalYAMLObject.locations).map(
      key => {
        const thisLocation: LocationAttributes = this.finalYAMLObject.locations[
          key
        ];

        const planPrices = Object.keys(thisLocation.planIds).map(key => {
          const numPlans = thisLocation.planIds[key];
          const plan = this.finalYAMLObject.plans[key];
          // since this updates continuously, sometimes the plan doesn't exist (like if none are added to a location yet)
          if (plan) {
            // handle addons
            const flatAddons = {};
            Object.keys(plan).map(planField => {
              const currentField = plan[planField];
              if (Array.isArray(currentField)) {
                currentField.map(arrayItem => {
                  flatAddons[arrayItem.name] = this.pricing["location"]["plan"][
                    arrayItem.name
                  ];
                });
              }
            });
            console.log("the plan", plan);
            const hoursOfMotion = this.toNumberWithUnits(plan.cameraMotion)
              .number; // per day
            const percentMotion = hoursOfMotion / 24; // is float
            const cloudStorage = this.toNumberWithUnits(plan.cloudRetention)
              .number;
            const bitrate = this.estimateBitRate(
              percentMotion,
              plan.resolution
            );
            console.log("this is the bitrate", bitrate);
            const eventSeconds = this.pricing["location"]["plan"]["cloudData"]
              .EVENT_DURATION_SECONDS;

            const estimatedEventsUploaded = Math.round(
              (hoursOfMotion * 60 * 60) / eventSeconds
            );
            // calculate stream pricing ((which is the price of video + price of events) * storage duration
            const saasPricePerStream = this.getEstimatedSaasPrice(
              estimatedEventsUploaded,
              hoursOfMotion,
              percentMotion,
              bitrate,
              cloudStorage
            );
            return {
              saasPricePerStream,
              numPlans,
              flatAddons
            };
          }
        });

        // I want to grab every plan and find it's equivilant 2 MP count, then sort by
        // MP rating such that all plans with the same rating are grouped together, then, sort
        // by largest to smallest MP rating

        // with that info, I want to loop through every box configuration and fill up each
        // box with biggest resolution on down.
        // when we run out of streams, check to see if all the streams in this box would fit in a smaller
        // box. if so, then continue trying until it fails

        //
        const streamCounts = Object.keys(thisLocation.planIds)
          .map(planKey => {
            const plan = this.finalYAMLObject.plans[planKey];
            // if the plan is at that location and exists
            if (plan && thisLocation.planIds[planKey]) {
              const amt2MPStreams = this.normalizeStreams(
                thisLocation.planIds[planKey],
                this.toNumberWithUnits(plan.resolution).number
              );
              return {
                xMPCount: plan.camerasAssigned,
                xMP: plan.resolution,
                TwoMPCount: amt2MPStreams
              };
            }
          })
          .filter(val => val) as Array<any>;

        // thanks to: https://stackoverflow.com/a/46794337
        const helper = {};
        const result = streamCounts.reduce((prevVal, currVal) => {
          const key = currVal.xMP;

          if (!helper[key]) {
            helper[key] = Object.assign({}, currVal); // create a copy of o
            prevVal.push(helper[key]);
          } else {
            helper[key].xMPCount += currVal.xMPCount;
          }

          return prevVal;
        }, []);
        console.log("result", result);

        return {
          title: thisLocation.title,
          numCameras: thisLocation.numCameras,
          useVM: thisLocation.useVM,
          saasPrice: planPrices
        };
      }
    );

    return {
      overallPricing,
      pricingPerLocation
    };
  }

  // These are important:
  /**

    estimatedPrice: function() {
        var videoPriceCents = widget.app.estimatedVideoBytesMonthly() * CONFIG.PRICE_GCS_PER_BYTE_PER_MONTH_CENTS;
        var eventPriceCents = Number(widget.app.events_uploaded_count) * 30.5 * CONFIG.PRICE_PER_EVENT_WRITTEN_STORED_PER_MONTH_CENTS;
        var m = Math.max(Number(widget.app.storage_duration_days), 30) / 30;
        return m * (videoPriceCents + eventPriceCents);
    },
    estimateBitrate: function() {
        var m;
        switch(widget.app.scene_activity) {
        case "high":
            m = 1.0;
            break;
        case "medium":
            m = 0.7;
            break;
        case "low":
            m = 0.5;
            break;
        default:
            m = 1.0;
            break;
        }
        var b = CONFIG.resolutions[widget.app.resolution]["bitrate"] || 2048;
        var br = Math.round(b*m);
        // console.log("b*m is "+b+"*"+m);
        if (widget.app) widget.app.bitrate = br;
        return br;
    },
    estimatedMaxStreamCount: function(model) {
        var maxStreams = CONFIG.models[model]["counts"][widget.app.resolution];
        var fpsFactor = Number(widget.app.fps) > CONFIG.FPS_RATED ? 0.80 : 1.0;
        maxStreams *= fpsFactor;
        return Math.round(maxStreams);
    },
   */
}
</script>
<!----------------- END JS/TS --------------------->

<!----------------- BEGIN HTML -------------------->
<template lang="html">
  <div class="the-estimate-page"></div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.the-estimate-page {
}
</style>
<!----------------- END CSS/SCSS ------------------>
