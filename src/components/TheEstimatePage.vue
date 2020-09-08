<!----------------- BEGIN JS/TS ------------------->
<script lang="ts">
import { FinalYAMLObject, LocationAttributes, MPCounts } from "@/new-models";
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
        if (streamCounts.length > 0) {
          let streamCountsAs2MP = streamCounts
            .map(count => count.twoMPCount)
            .reduce((prevVal, currVal) => {
              return prevVal + currVal;
            });
          let remainingRoom = streamCountsAs2MP;
          console.log("stream counts as 2MP", streamCountsAs2MP);
          const boxesUsed: {
            [key: string]: number;
          } = {};
          // sort the keys so that we have an order from biggest to smallest option (exclude the boxVM)
          const sortedKeys = Object.keys(this.pricing["location"]["hardware"])
            .sort((a, b) => {
              return (
                this.pricing["location"]["hardware"][b]["counts"]["2 MP"] -
                this.pricing["location"]["hardware"][a]["counts"]["2 MP"]
              );
            })
            .filter(key => key !== "BoxVM");

          let remainder = 0;
          // the threshold to determine if we should just move up a box instead of replicating low level ones
          const threshold = this.pricing["location"]["plan"]["cloudData"]
            .UPGRADE_BOX_THRESHOLD_PERCENT;

          // TODO: make work for < 2MP case and > 2MP case, currently just works for exact
          sortedKeys.every((key, index, allKeysArr) => {
            console.log("on this box: " + key);
            const currentBox = {
              ...this.pricing["location"]["hardware"][key]
            };
            const numBoxesOfThisModel = Math.round(
              streamCountsAs2MP / currentBox["counts"]["2 MP"]
            );
            console.log("number of boxes of this model", numBoxesOfThisModel);
            console.log("counts for this model", currentBox["counts"]["2 MP"]);
            console.log("no Math floor", currentBox["counts"]["2 MP"]);
            // const leftoverStreams =
            //   streamCountsAs2MP % currentBox["counts"]["2 MP"];
            remainingRoom =
              remainingRoom -
              numBoxesOfThisModel * currentBox["counts"]["2 MP"];

            console.log("remaining room", remainingRoom);
            if (numBoxesOfThisModel >= 1) {
              // aggressively check for an upgrade (we don't want to give them like 5 1100A's)
              if (index - 1 >= 0 && numBoxesOfThisModel > 1) {
                const nextKey = allKeysArr[index - 1];
                const smallerBoxMP = streamCountsAs2MP;
                const nextBoxMP = this.pricing["location"]["hardware"][nextKey][
                  "counts"
                ]["2 MP"];
                if (Math.floor(nextBoxMP * threshold) <= smallerBoxMP) {
                  console.log("upgrading model");
                  // then upgrade to nextBox
                  if (boxesUsed[nextKey]) {
                    boxesUsed[nextKey]++;
                  } else {
                    boxesUsed[nextKey] = 1;
                  }
                } else {
                  console.log("not upgrading");
                  boxesUsed[key] = numBoxesOfThisModel;
                }
              } else {
                console.log(
                  `adding (${numBoxesOfThisModel})boxes of this type`
                );
                boxesUsed[key] = numBoxesOfThisModel;
              }
            }

            // if we have streams left, continue to next box type, but update amount of streamsAs2mp
            if (remainingRoom > 1) {
              streamCountsAs2MP = remainingRoom;
              return true; // i.e. continue
            } else {
              // 1 or 0 left
              remainder = 0;
              return false; // i.e. break
            }
          });
          if (remainder > 0) {
            // add the lowest powered box to handle stragglers
            // TODO: handle min chunk here?? maybe by getting 2 mp ratings then checking if chunk is smaller

            // if all of the boxes are totally full, then we have to add this last one
            if (remainingRoom <= 0) {
              const smallestBoxKey = sortedKeys[sortedKeys.length - 1];
              if (boxesUsed[smallestBoxKey]) {
                boxesUsed[smallestBoxKey]++;
              } else {
                boxesUsed[smallestBoxKey] = 1;
              }
            }
          }
          // Adjust for many lower level boxes

          console.log("these are the boxes used", boxesUsed);
          console.log("ordered stream counts", streamCounts);
          const maxCount = 100; // to prevent infinite loop
          const count = 0;
          // if (streamCounts.length > 0) {
          //   const boxCounts = Object.keys(
          //     this.pricing["location"]["hardware"]
          //   ).map((key, index, allKeysArr) => {
          //     let currentBox = { ...this.pricing["location"]["hardware"][key] };
          //     let resolutionIndex = 0;
          //     const boxFull = false;
          //     const streamCountCopy = [...streamCounts];
          //     // this loop is for iterating through resolutions until they are empty, then incrementing the index
          //     while (
          //       resolutionIndex < streamCountCopy.length &&
          //       streamCountCopy[resolutionIndex].xMPCount > 0 &&
          //       count < maxCount
          //     ) {
          //       count++;
          //       console.log(
          //         "this is the stream count at the beginning of the loop",
          //         streamCountCopy
          //       );
          //       const twoMPBoxCount = currentBox["counts"]["2 MP"];

          //       // the minimum chunk in 2 mp streams
          //       const minChunk = this.normalizeStreams(
          //         1,
          //         this.toNumberWithUnits(streamCountCopy[resolutionIndex].xMP)
          //           .number
          //       );
          //       // in this case, we have 0.3, 0.9, or 1.3 -- this should happen at the end
          //       if (minChunk == 0) {
          //         const remainingAtSmallResolution = this.deNormalizeStreams(
          //           twoMPBoxCount,
          //           this.toNumberWithUnits(streamCountCopy[resolutionIndex].xMP)
          //             .number
          //         );
          //         console.log(
          //           "went in min chunk == 0, we have " +
          //             remainingAtSmallResolution +
          //             " remaining a this resolution"
          //         );
          //         // if we can add another resolution to a box, do that
          //         if (
          //           streamCountCopy[resolutionIndex].xMPCount >= 1 &&
          //           currentBox["counts"][
          //             streamCountCopy[resolutionIndex].xMPCount
          //           ] >= 1
          //         ) {
          //           currentBox["counts"][
          //             streamCountCopy[resolutionIndex].xMPCount
          //           ] -= 1;
          //           streamCountCopy[resolutionIndex].xMPCount -= 1;
          //         }
          //         // if the box is full
          //         if (
          //           currentBox["counts"][
          //             streamCountCopy[resolutionIndex].xMPCount
          //           ] == 0
          //         ) {
          //           // then we need to add a new box of this type and reset the counts
          //           boxesUsed.push(currentBox);
          //           currentBox = { ...this.pricing["location"]["hardware"][key] };
          //         }
          //         // if the resolution is empty
          //         if (streamCountCopy[resolutionIndex].xMPCount >= 0) {
          //           // simply move on to the next resolution
          //           resolutionIndex++;
          //         }
          //       } else {
          //         // the current resolution is >= 2 MP so we can assign a "chunk" size each time
          //         const remaining2MPStreams =
          //           currentBox["counts"]["2 MP"] - minChunk;
          //         console.log(
          //           "currentResolution is >= 2 MP, we have ",
          //           remaining2MPStreams +
          //             " remaining in the box and " +
          //             streamCountCopy[resolutionIndex].xMPCount +
          //             " at this resolution"
          //         );
          //         // if they are the same size
          //         if (remaining2MPStreams == 0) {
          //           streamCountCopy[resolutionIndex].xMPCount -= 1;
          //           streamCountCopy[resolutionIndex].twoMPCount -= minChunk;
          //           // then we need to add this box and reset
          //           boxesUsed.push(currentBox);
          //           currentBox = { ...this.pricing["location"]["hardware"][key] };

          //           // if there is still room in the box
          //         } else if (remaining2MPStreams > 0) {
          //           streamCountCopy[resolutionIndex].xMPCount -= 1;
          //           streamCountCopy[resolutionIndex].twoMPCount -= minChunk;

          //           if (streamCountCopy[resolutionIndex].xMPCount == 0) {
          //             streamCountCopy[resolutionIndex].xMPCount -= 1;
          //             resolutionIndex++;
          //           }
          //           currentBox["counts"]["2 MP"] = remaining2MPStreams;

          //           // if the minChunk is just too big for the remaining space in the box
          //         } else if (remaining2MPStreams < 0) {
          //           // we could add a box, or we could move on to a smaller box... which is correct
          //           // we could see how far off?
          //           // for now, lets just try a smaller resolution
          //           resolutionIndex++;
          //         }
          //       }
          //     }
          //     // TODO: check against other boxes??
          //   });
          //   console.log("Boxes used", boxesUsed);
          // }
          // // ------- PREVIOUS CODE ---------
          // with that info, I want to loop through every box configuration and fill up each
          // box with biggest resolution on down.
          // when we run out of streams, check to see if all the streams in this box would fit in a smaller
          // box. if so, then continue trying until it fails
          // const boxCounts = Object.keys(this.pricing["location"]["hardware"]).map(
          //   (key, index, allKeysArr) => {
          //     // loop through each box configuration
          //     // if we use all the highest resolution cameras, then push them onto an array, take them out of resolutions,
          //     // and try the next resolution in the list
          //     const currentBox = this.pricing["location"]["hardware"][key];
          //     let twoMPBoxCount = currentBox["counts"]["2 MP"];
          //     const boxCount = 0;
          //     const boxes = {};
          //     const usedResolutions: any[] = [];
          //     // TODO: check to see if all will fit on one box.. try to find the smallest
          //     if (streamCounts) {
          //       for (let i = streamCounts.length - 1; i >= 0; --i) {
          //         if (streamCounts[i]) {
          //           const tempBoxCount =
          //             twoMPBoxCount - streamCounts[i].twoMPCount;
          //           if (tempBoxCount >= 0) {
          //             // then the streams are either exactly equal or (perfect) or we need another iteration
          //             // so, update the box count and add the resolution onto this boxes list
          //             usedResolutions.push(streamCounts.splice(i, 1)[0]);
          //             twoMPBoxCount = twoMPBoxCount - streamCounts[i].twoMPCount;
          //           } else {
          //             // then this resolution won't work, so try the next one down
          //           }
          //         }
          //       }
          //     }
          //     // if (streamCounts) {
          //     // these are the streamcounts at thisLocation
          //     // TODO: calculate bom if they useVM is true (basically just add up all the cores of the available boxes)
          //   }
          // );
          let VM = null;
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
  <div class="the-estimate-page"></div>
</template>
<!----------------- END HTML ---------------------->

<!----------------- BEGIN CSS/SCSS ---------------->
<style scoped lang="scss">
.the-estimate-page {
}
</style>
<!----------------- END CSS/SCSS ------------------>
