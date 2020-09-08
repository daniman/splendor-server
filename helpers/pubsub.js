const Redis = require("ioredis");
const { RedisPubSub } = require("graphql-redis-subscriptions");

const pubsub = new RedisPubSub({
  publisher: process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL)
    : new Redis(),
  subscriber: process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL)
    : new Redis(),
});

module.exports = pubsub;
