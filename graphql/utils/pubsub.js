// create redis apollo pubsub with host "127.0.0.1" and port 6379
import { RedisPubSub } from "graphql-redis-subscriptions";
import redisUrlParse from "redis-url-parse";

const url = process.env.REDIS_URL;
const parsedURL = redisUrlParse(url);
const { host, port, password } = parsedURL;
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
