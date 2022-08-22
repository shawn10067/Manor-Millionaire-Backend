import { subscribe } from "graphql";
import { withFilter } from "graphql-subscriptions";
import pubsub from "../utils/pubsub.js";

const resolvers = {
  Subscription: {
    searchedUsers: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("SEARCHED_USERS"),
        (payload, variables) => {
          console.log(payload, variables);
          return typeof payload === "string";
        }
      ),
    },
    landedCash: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("LANDED_CASH"),
        (payload, variables) => {
          console.log(payload, variables);
          return true;
        }
      ),
    },
  },
};

export default resolvers;
