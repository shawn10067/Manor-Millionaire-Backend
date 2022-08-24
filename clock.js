import { CronJob } from "cron";
import postBail from "./graphql/utils/postBail";

// create a cron job that runs postBail every at 12 pm New York time
new CronJob({
  cronTime: "00 00 12 * * *",
  onTick: postBail,
  start: true,
  timeZone: "America/New_York",
});

// create a cron job that runs postBail every at 12 am New York time
new CronJob({
  cronTime: "00 00 00 * * *",
  onTick: postBail,
  start: true,
  timeZone: "America/New_York",
});
