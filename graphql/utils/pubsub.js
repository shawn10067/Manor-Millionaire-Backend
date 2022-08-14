// create redis apollo pubsub with host "127.0.0.1" and port 6379
import { RedisPubSub } from "graphql-redis-subscriptions";

const pubsub = new RedisPubSub({
  connection: {
    host: "127.0.0.1",
    port: 6379,
    retryStrategy: (options) => Math.max(options.attempt * 100, 3000),
  },
});

export default pubsub;
