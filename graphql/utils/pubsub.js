// create redis apollo pubsub with host "127.0.0.1" and port 6379
import { RedisPubSub } from "graphql-redis-subscriptions";
import redisUrlParse from "redis-url-parse";

const url =
  "redis://:p89252ba53342e3b4d3b75a2603586e71112e8c1a8ec7ee26ee77e1b4e99ef9a1@ec2-44-208-207-66.compute-1.amazonaws.com:28049";
const parsedURL = redisUrlParse(url);
const { host, port, password, database } = parsedURL;
const pubsub = new RedisPubSub({
  connection: {
    host,
    port,
    password,
    db: 0,
    retryStrategy: (options) => Math.max(options.attempt * 100, 3000),
  },
});

export default pubsub;
