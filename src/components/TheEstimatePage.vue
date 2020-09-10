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
    estimatedEventsUploadedDays: number,
    bitrate: number
  ) {
    // (events uploaded * the duration of an event in seconds * the bitrate * size of a kilobit (why?))
    const eventSeconds = this.pricing["location"]["plan"]["cloudData"]
      .EVENT_DURATION_SECONDS;
    const kilobits = this.pricing["location"]["plan"]["cloudData"].KILOBITS;
    return (
      ((estimatedEventsUploadedDays * eventSeconds * bitrate * kilobits) / 8) *
      30.5
    );
  }

  estimateBitRate(cameraMotionPercent: number, resolution: string) {
    console.log("the rez", resolution);
    const initialBitrate = this.mpMapping[resolution].bitrate || 2048;
    return Math.round(cameraMotionPercent * initialBitrate);
  }

  getEstimatedSaasPrice(
    estimatedEventsUploadedDays: number,
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
      this.estimateVideoBytesMonthly(estimatedEventsUploadedDays, bitrate) *
      cloudStorageCost;
    const eventPriceCents = estimatedEventsUploadedDays * 30.5 * eventWriteCost;
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
        const eventsPerDay = (60 * 60 * 24) / eventSeconds;

        let estimatedEventsUploadedDays = 0;
        if (plan.indexing.type == "Lazy") {
          // then units are days
          // percentage of month (to get a ratio)
          const lazyPercent =
            this.toNumberWithUnits(plan.indexing.option).number / 30.5;
          estimatedEventsUploadedDays = lazyPercent * eventsPerDay;
        } else if (plan.indexing.type == "Query Match") {
          // units are percentage of month
          // use ratio directly on events per day
          const matchingQueriesPercent =
            this.toNumberWithUnits(plan.indexing.option).number / 100;
          estimatedEventsUploadedDays = matchingQueriesPercent * eventsPerDay;
        } else {
          // use the hours of motion per day
          estimatedEventsUploadedDays = percentMotion * eventsPerDay;
        }

        // calculate stream pricing ((which is the price of video + price of events) * storage duration
        const saasPricePerStream = this.getEstimatedSaasPrice(
          estimatedEventsUploadedDays,
          hoursOfMotion,
          percentMotion,
          bitrate,
          cloudStorage
        );
        return {
          saasPricePerStream,
          numPlans,
          flatAddons,
          planName: plan.title
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
        let boxesUsed: UsedBox[] = [];
        if (streamCounts.length > 0) {
          /** This function handles the box allocations based on the streamcounts from before. It basically works as follows:
           * Iterate through streamCounts,
           * for each type (from biggest to smallest), get the minimum chunk (i.e if we have 12mp, we can only split into 3 2mp streams at a minimum),
           * check for extra space in used boxes object (if empty, go to next part),
           * If we can fill up space in another box, do that.
           * If there is still space after filling up some box, iterate through boxes and try to assign the streams to a box
           */
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
          // merge all the like boxes into one and handle upgrades (currently just merge)
          const helper = {};
          boxesUsed.map(box => {
            if (!helper[box.boxKey]) {
              helper[box.boxKey] = Object.assign(box, { count: 1 });
            } else {
              helper[box.boxKey]["count"]++;
              Object.keys(box.streamsAdded).forEach(key => {
                if (helper[box.boxKey].streamsAdded[key]) {
                  helper[box.boxKey].streamsAdded[key].twoMPCount +=
                    box.streamsAdded[key].twoMPCount;
                  helper[box.boxKey].streamsAdded[key].xMPCount +=
                    box.streamsAdded[key].xMPCount;
                } else {
                  helper[box.boxKey].streamsAdded[key] = box.streamsAdded[key];
                }
              });
            }
          });
          boxesUsed = Object.keys(helper).map(key => helper[key]);

          let VM: BoxCounts | null = null;
          if (thisLocation.useVM) {
            VM = boxesUsed
              .map(
                box => this.pricing["location"]["hardware"][box.boxKey]["bom"]
              )
              .reduce((prev, curr) => {
                return {
                  cores: prev.cores + curr.cores,
                  ram: prev.ram + curr.ram
                };
              });
          }

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

  getTotalSaas(plan) {
    let addOnsCombined = 0;
    if (Object.keys(plan.flatAddons).length > 0) {
      addOnsCombined = Object.keys(plan.flatAddons)
        .map(key => {
          return plan.flatAddons[key] * plan.numPlans;
        })
        .reduce((p, c) => {
          return p + c;
        });
    }
    const saas = plan.saasPricePerStream * plan.numPlans;
    return addOnsCombined + saas;
  }

  getTotalHardware(box: UsedBox & { count: number }) {
    return box.boxInfo.boxInfo["price"] * box.count;
  }

  getTotalBoxStreams(box: UsedBox) {
    return box.twoMpCount;
  }

  getAddOns(plan) {
    let totalStreams = 0;
    Object.keys(plan.flatAddons).forEach(key => {
      totalStreams += plan.flatAddons[key];
    });
    return totalStreams;
  }

  getBoxText(location, box) {
    if (location.useVM) {
      return `BoxVM (${location.VM.cores} cores, ${location.VM.ram} GB of RAM)`;
    } else {
      return `${box.boxKey} Camio Box`;
    }
  }

  getLocationTotalSaas(location) {
    let grandTotal = 0;
    location.saasPrice.forEach(saasPrice => {
      if (saasPrice) {
        grandTotal += this.getTotalSaas(saasPrice);
      }
    });
    return grandTotal;
  }

  getLocationTotalHardware(location) {
    let grandTotal = 0;
    location.boxesUsed.forEach(box => {
      if (location.useVM) {
        return;
      }
      grandTotal += this.getTotalHardware(box);
    });
    return grandTotal;
  }

  getOverallSaas(prices) {
    let total = 0;
    prices.forEach(price => {
      total += price.price;
    });
    return total;
  }

  get grandTotalSaas() {
    const overallSaasPrice = this.getOverallSaas(this.prices.overallPricing);
    let locationPrices = 0;
    this.prices.pricingPerLocation.forEach(location => {
      if (location) {
        locationPrices += this.getLocationTotalSaas(location);
      }
    });
    return overallSaasPrice + locationPrices;
  }

  get grandTotalHardware() {
    let hardwarePrices = 0;
    this.prices.pricingPerLocation.forEach(location => {
      if (location) {
        hardwarePrices += this.getLocationTotalHardware(location);
      }
    });
    return hardwarePrices;
  }

  // These are important: (what is this?)
  /**
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
      <div class="responsive-pricing-container">
        <div class="table-row">
          <div class="three-col"></div>
          <div class="one-col cost-header">One-Time</div>
          <div class="one-col cost-header">Recurring</div>
        </div>
        <div class="table-row new-table">
          <div class="five-col section-title account">
            Account-Wide Expenses
          </div>
        </div>
        <div
          class="table-row entry green-background"
          v-for="(overallField, index) in prices.overallPricing"
          :key="`${index}-overall-price`"
        >
          <div class="one-col count">1x</div>
          <div class="two-col item-title">
            {{ titles[overallField.key] }}:
            {{ finalYAMLObject.overall[overallField.key] }}
          </div>
          <div class="one-col"></div>
          <div class="one-col">
            <div class="table-row main-price">
              {{ overallField.price | formatMoney }}
            </div>
          </div>
        </div>
        <div class="table-row">
          <div class="three-col"></div>
          <div class="one-col location-total account"></div>
          <div class="one-col location-total account">
            {{ getOverallSaas(prices.overallPricing) | formatMoney }}
          </div>
        </div>
        <div
          class="table-row with-sub-tables new-table"
          v-for="(location, index) in prices.pricingPerLocation"
          :key="`${index}-location-pricing-breakdown`"
        >
          <div class="table-row with-sub-tables" v-if="location">
            <div class="table-row">
              <div class="five-col section-title">{{ location.title }}</div>
            </div>
            <div
              class="table-row with-sub-tables entry orange-background"
              v-for="(plan, index) in location.saasPrice"
              :key="`${index}-location-saas-price-field`"
            >
              <div class="table-row" v-if="plan">
                <div class="one-col count">{{ plan.numPlans }}x</div>
                <div class="two-col">
                  <div class="table-row with-sub-tables">
                    <div class="table-row item-title">{{ plan.planName }}</div>
                    <div
                      class="table-row sub-price add-on"
                      v-for="(addon, key) in plan.flatAddons"
                      :key="`${key}-location-addon-price-field`"
                    >
                      {{ key }} @ {{ addon | formatMoney }} / stream
                    </div>
                  </div>
                </div>
                <div class="one-col"></div>
                <div class="one-col">
                  <div class="table-row with-sub-tables">
                    <div class="table-row main-price">
                      {{ getTotalSaas(plan) | formatMoney }} / mo
                    </div>
                    <div class="table-row sub-price">
                      {{
                        (plan.saasPricePerStream + getAddOns(plan))
                          | formatMoney
                      }}
                      per stream
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="table-row with-sub-tables entry orange-background"
              v-for="(box, index) in location.boxesUsed"
              :key="`${index}-location-box-price-field`"
            >
              <div class="table-row" v-if="box">
                <div class="one-col count">
                  {{ location.useVM ? 1 : box.count }}x
                </div>
                <div class="two-col item-title">
                  {{ getBoxText(location, box) }}
                </div>
                <div class="one-col">
                  <div class="table-row with-sub-tables">
                    <div class="table-row main-price">
                      {{
                        location.useVM ? 0 : getTotalHardware(box) | formatMoney
                      }}
                    </div>
                    <div class="table-row sub-price">
                      {{ getTotalBoxStreams(box) }} streams each
                    </div>
                  </div>
                </div>
                <div class="one-col"></div>
              </div>
            </div>
          </div>
          <div class="table-row" v-if="location">
            <div class="three-col"></div>
            <div class="one-col location-total">
              {{ getLocationTotalHardware(location) | formatMoney }}
            </div>
            <div class="one-col location-total">
              {{ getLocationTotalSaas(location) | formatMoney }}
            </div>
          </div>
        </div>
        <div class="table-row grand-total">
          <div class="two-col big-orange">
            Grand Total
          </div>
          <div class="three-col make-full">
            <div class="table-row with-sub-tables">
              <div class="table-row">
                <div class="two-col sub-orange">
                  One-Time:
                </div>
                <div class="three-col total-price">
                  {{ grandTotalHardware | formatMoney }}
                </div>
              </div>
              <div class="table-row">
                <div class="two-col sub-orange">
                  Recurring:
                </div>
                <div class="three-col total-price">
                  {{ grandTotalSaas | formatMoney }} / mo
                </div>
              </div>
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

    .responsive-pricing-container {
      display: flex;
      flex-direction: column;
      padding: 10px;

      .table-row {
        display: flex;
        width: 100%;

        &.with-sub-tables {
          flex-direction: column;
        }

        &.entry {
          padding: 7px 0px;
        }

        &.green-background {
          background: rgba(203, 227, 196, 0.22);
        }

        &.orange-background {
          background-color: #fcf8e3;
        }

        &.new-table {
          margin-top: 20px;
        }

        &.grand-total {
          margin: 15px -13px -13px -13px;
          padding: 15px 0px;
          background: #faebcc;
          border: 3px solid #f7931e;
          width: calc(100% + 26px);
          align-items: center;

          .big-orange {
            font-weight: bold;
            font-size: 40px;
            color: #f7931e;
            justify-content: center;
            align-items: center;
          }

          .sub-orange {
            font-weight: bold;
            font-size: 30px;
            color: #f7931e;
            align-items: center;
          }

          .total-price {
            font-weight: bold;
            font-size: 30px;
            line-height: 35px;
            color: #222222;
            align-items: center;
            justify-content: flex-end;
            padding-right: 5%;
          }

          @media only screen and (max-width: 925px) {
            flex-direction: column;

            .big-orange {
              width: 100%;
            }

            .sub-orange {
              width: 50%;
              justify-content: center;
            }

            .total-price {
              width: 50%;
            }

            .make-full {
              width: 100%;
            }
          }
        }

        .one-col {
          width: 20%;
          display: flex;
        }
        .two-col {
          width: 40%;
          display: flex;
        }
        .three-col {
          width: 60%;
          display: flex;
        }
        .four-col {
          width: 80%;
          display: flex;
        }
        .five-col {
          width: 100%;
          display: flex;
        }

        .cost-header {
          font-weight: bold;
          font-size: 25px;
          color: #222222;
          text-decoration: underline;
          justify-content: flex-end;
          align-self: center;
          padding-right: 1.5%;
        }

        .location-total {
          border-top: 4px solid #f7931e;
          font-size: 25px;
          justify-content: flex-end;
          font-weight: bold;
          padding-top: 10px;
          margin-left: 10px;
          padding-right: 1.5%;
          color: #f7931e;

          &.account {
            border-top: 4px solid #50b536;
            color: #50b536;
          }
        }

        .section-title {
          font-weight: bold;
          font-size: 20px;
          color: white;
          background-color: #f7931e;
          opacity: 0.9;
          padding: 5px 3%;
          border-top-right-radius: 10px;
          border-top-left-radius: 10px;

          &.account {
            color: white;
            background-color: #50b536;
          }
        }

        .count {
          font-weight: bold;
          font-size: 25px;
          text-align: center;
          align-items: center;
          color: #50b536;
          justify-content: center;
          padding-right: 8%;
        }

        .item-title {
          font-size: 17px;
          color: #222222;
          align-items: center;
        }

        .main-price {
          font-weight: bold;
          font-size: 20px;
          justify-content: flex-end;
          color: #222222;
          padding-right: 8%;
        }

        .sub-price {
          font-style: italic;
          font-size: 15px;
          color: #222222;
          justify-content: flex-end;
          padding-right: 8%;
        }

        .add-on {
          justify-content: flex-start;
        }
      }
    }
  }
}
</style>
<!----------------- END CSS/SCSS ------------------>
