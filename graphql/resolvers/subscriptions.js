import pubsub from "../utils/pubsub.js";

const resolvers = {
  Subscription: {
    searchedUsers: {
      subscribe: () => pubsub.asyncIterator("SEARCHED_USERS"),
    },
  },
};

export default resolvers;
