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
        ({ landedCash }, { propertyOwnerId }) => {
          const { propertyOwnerId: landedPropertyOwnerId } = landedCash;
          if (landedPropertyOwnerId === propertyOwnerId) {
            return true;
          } else {
            return false;
          }
        }
      ),
    },
  },
};

export default resolvers;
