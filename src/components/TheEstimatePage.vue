<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import {
  BoxCounts,
  FinalYAMLObject,
  LocationAttributes,
  MPCounts,
  UsedBox
} from "@/new-models";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
@Component({
  components: {},
  filters: {
    formatMoney(amountCents) {
      console.log("this is the money put in:", amountCents);
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

  @Prop() titles!: { [key: string]: string };
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
    const split = stringToConvert.split(" ").filter(Boolean);
    return {
      number: Number(split[0]),
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

  normalizeStreams(
    numStreamsOfCertainResolution: number,
    mpOfThoseStreams: number
  ) {
    return (
      numStreamsOfCertainResolution * Math.pow(mpOfThoseStreams / 2.0, 2 / 3)
    );
  }

  deNormalizeStreams(amtOf2MPStreams: number, mpOfDesiredStream: number) {
    return amtOf2MPStreams / Math.pow(mpOfDesiredStream / 2, 2 / 3);
  }

  estimatePlanPrices(thisLocation: LocationAttributes) {
    return Object.keys(thisLocation.planIds).map(key => {
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
        const hoursOfMotion = this.toNumberWithUnits(plan.cameraMotion).number; // per day
        const percentMotion = hoursOfMotion / 24; // is float
        const cloudStorage = this.toNumberWithUnits(plan.cloudRetention).number;
        const bitrate = this.estimateBitRate(percentMotion, plan.resolution);
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
  }

  calculateStreamCounts(thisLocation: LocationAttributes) {
    const helper = {};
    return Object.keys(thisLocation.planIds)
      .map(planKey => {
        const plan = this.finalYAMLObject.plans[planKey];
        // if the plan is at that location and exists
        if (plan && thisLocation.planIds[planKey]) {
          return {
            xMPCount: thisLocation.planIds[planKey],
            xMP: plan.resolution,
            twoMPCount: 0
          } as MPCounts;
        }
      })
      .filter(val => val)
      .reduce((prevVal: MPCounts[], currVal) => {
        // thanks to: https://stackoverflow.com/a/46794337
        if (currVal) {
          // if the helper object does not have this MP rating listed, then add it to the object and add it to the array
          if (!helper[currVal.xMP]) {
            helper[currVal.xMP] = Object.assign({}, currVal); // create a copy of currVal
            prevVal.push(helper[currVal.xMP]);
            // otherwise, it's already in the helper object so add it to the count for that type
          } else {
            helper[currVal.xMP].xMPCount += currVal.xMPCount;
          }
        }
        return prevVal;
      }, [])
      .sort((a, b) => {
        return (
          Number(this.toNumberWithUnits(b.xMP).number) -
          Number(this.toNumberWithUnits(a.xMP).number)
        );
      })
      .map(counts => {
        const newObj = { ...counts };
        // use the ceiling so that we over estimate
        newObj.twoMPCount = Math.ceil(
          this.normalizeStreams(
            newObj.xMPCount,
            this.toNumberWithUnits(newObj.xMP).number
          )
        );
        return newObj;
      });
  }

  get overallPrice() {
    return this.prices.overallPricing
      .map(priceObject => {
        return priceObject.price;
      })
      .reduce((p, c) => p + c);
  }

  getChunkSize(mpRating: string) {
    const mp = this.toNumberWithUnits(mpRating).number;
    const as2Mp = this.normalizeStreams(1, mp);
    return as2Mp < 1 ? 1 : as2Mp;
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
        const planPrices = this.estimatePlanPrices(thisLocation);
        // note: this seperates them into each stream count.. maybe in the future we can have a more
        // complicated algorithm
        const streamCounts = this.calculateStreamCounts(thisLocation);
        const boxTypes = Object.keys(this.pricing["location"]["hardware"])
          .filter(key => key !== "BoxVM")
          .sort((a, b) => {
            return (
              this.pricing["location"]["hardware"][a]["counts"]["2 MP"] -
              this.pricing["location"]["hardware"][b]["counts"]["2 MP"]
            );
          })
          .map(key => {
            return {
              twoMpCount: this.pricing["location"]["hardware"][key]["counts"][
                "2 MP"
              ],
              boxKey: key,
              boxInfo: this.pricing["location"]["hardware"][key]
            };
          });
        const boxesUsed: UsedBox[] = [];
        if (streamCounts.length > 0) {
          streamCounts.every((streamType, index, allTypesArr) => {
            const minimum2MpChunkSize = this.getChunkSize(streamType.xMP);

            boxesUsed.every((box, index, usedBoxArr) => {
              let count = 0;
              let spaceUsed = minimum2MpChunkSize * count;
              while (
                box.remainingSpace() - spaceUsed > 0 &&
                spaceUsed < streamType.twoMPCount
              ) {
                count++;
                spaceUsed = minimum2MpChunkSize * count;
              }

              const streamToAdd = {
                xMPCount: this.deNormalizeStreams(
                  minimum2MpChunkSize * count,
                  this.toNumberWithUnits(streamType.xMP).number
                ),
                xMP: streamType.xMP,
                twoMPCount: minimum2MpChunkSize * count
              };

              box.streamsAdded[streamType.xMP] = { ...streamToAdd };

              streamType.twoMPCount =
                streamType.twoMPCount - minimum2MpChunkSize * count;
              streamType.xMPCount = this.deNormalizeStreams(
                streamType.twoMPCount,
                this.toNumberWithUnits(streamType.xMP).number
              );
            });

            while (streamType.twoMPCount > 0) {
              boxTypes.every((boxType, index, allBoxTypesArr) => {
                // if the last one or if the two counts match
                if (
                  index == allBoxTypesArr.length - 1 ||
                  streamType.twoMPCount == boxType.twoMpCount
                ) {
                  // add it in before we update the iteration variable (so remaining works)
                  const helper = {};
                  helper[streamType.xMP] = { ...streamType };
                  boxesUsed.push({
                    boxKey: boxType.boxKey,
                    twoMpCount: boxType.twoMpCount,
                    boxInfo: boxType,
                    streamsAdded: helper,
                    remainingSpace: function() {
                      return (
                        this.twoMpCount -
                        Object.keys(this.streamsAdded)
                          .map(key => {
                            return this.streamsAdded[key].twoMPCount;
                          })
                          .reduce((p, c) => p + c)
                      );
                    }
                  });
                  streamType.twoMPCount -= boxType.twoMpCount;
                  // Don't take negatives
                  streamType.twoMPCount =
                    streamType.twoMPCount < 0 ? 0 : streamType.twoMPCount;
                  return false; // i.e. break
                }
                const nextBox = allBoxTypesArr[index + 1];
                // check if the count is between the next and current box, if it is use the current box
                if (
                  streamType.twoMPCount > boxType.twoMpCount &&
                  streamType.twoMPCount < nextBox.twoMpCount
                ) {
                  const helper = {};
                  helper[streamType.xMP] = { ...streamType };
                  boxesUsed.push({
                    boxKey: nextBox.boxKey,
                    twoMpCount: nextBox.twoMpCount,
                    boxInfo: nextBox,
                    streamsAdded: helper,
                    remainingSpace: function() {
                      return (
                        this.twoMpCount -
                        Object.keys(this.streamsAdded)
                          .map(key => {
                            return this.streamsAdded[key].twoMPCount;
                          })
                          .reduce((p, c) => p + c)
                      );
                    }
                  });
                  streamType.twoMPCount -= nextBox.twoMpCount;
                  // Don't take negatives
                  streamType.twoMPCount =
                    streamType.twoMPCount < 0 ? 0 : streamType.twoMPCount;
                  streamType.xMPCount = this.deNormalizeStreams(
                    streamType.twoMPCount,
                    this.toNumberWithUnits(streamType.xMP).number
                  );

                  return false; // i.e. break
                }
                return true; // i.e. continue, loop stops if you don't have this
              });
            }
            return true; // i.e. continue, loop stops if you don't have this
          });

          // TODO: do I need to handle upgrades? probably....

          let VM: BoxCounts | null = null;
          if (thisLocation.useVM) {
            VM = Object.keys(boxesUsed)
              .map(key => this.pricing["location"]["hardware"][key]["bom"])
              .reduce((prev, curr) => {
                return {
                  cores: prev.cores + curr.cores,
                  ram: prev.ram + curr.ram
                };
              });
          }
          //console.log("result", boxCounts);
          console.log("result2", streamCounts);

          return {
            title: thisLocation.title,
            numCameras: thisLocation.numCameras,
            useVM: thisLocation.useVM,
            saasPrice: planPrices,
            VM,
            boxesUsed
          };
        }
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
  <div class="the-estimate-page">
    <div class="totals-container">
      <div class="total-title">
        Totals
      </div>
      <div class="pricing-container">
        <div class="sub-titles">
          <div class="sub-title">
            One-Time
          </div>
          <div class="sub-title">
            Recurring
          </div>
        </div>
        <div class="prices">
          <div class="overall">
            <div class="overall-title">
              Account-Wide Expenses
            </div>
            <div
              class="item"
              v-for="(overallField, index) in prices.overallPricing"
              :key="`${index}-overall-price`"
            >
              <div class="overall-count">
                1x
              </div>
              <div class="field-title">
                {{ titles[overallField.key] }}:
                {{ finalYAMLObject.overall[overallField.key] }}
              </div>
              <div class="one-time"></div>
              <div class="recurring">
                {{ overallField.price | formatMoney }}
              </div>
            </div>
            <div class="totals-one-time"></div>
            <div class="totals">
              {{ overallPrice | formatMoney }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.the-estimate-page {
  display: flex;
  flex-direction: column;

  .totals-container {
    display: flex;
    flex-direction: column;
    border: 3px solid #f7931e;
    border-radius: 10px;

    .total-title {
      color: #ffffff;
      background: #f7931e;
      border-radius: 10px;
      line-height: 54px;
      font-weight: bold;
      font-size: 30px;
      padding-left: 20px;
      margin: -3px -3px 0px -3px;
    }

    .pricing-container {
      display: flex;
      flex-direction: column;

      .sub-titles {
        display: flex;
        justify-content: flex-end;

        .sub-title {
          font-weight: bold;
          font-size: 30px;
          color: #222222;
        }
      }

      .prices {
        display: flex;
        flex-direction: column;

        .overall {
          display: flex;
          flex-direction: column;
          padding-left: 5px;

          .overall-title {
            color: #ffffff;
            background: #50b536;
            width: fit-content;
            border-radius: 10px;
            line-height: 54px;
            font-weight: bold;
            font-size: 30px;
            padding: 0px 20px;
          }

          .item {
            display: flex;

            .overall-count {
              max-width: 30px;
            }

            .field-title {
              color: #222222;
              font-size: 20px;
              flex-grow: 3;
            }

            .one-time {
              flex-grow: 1;
            }

            .recurring {
              flex-grow: 1;
            }
          }
        }
      }
    }
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
