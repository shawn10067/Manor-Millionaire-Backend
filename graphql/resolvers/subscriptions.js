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
          return landedPropertyOwnerId === propertyOwnerId;
        }
      ),
    },
    sentTrade: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("SENT_TRADE"),
        ({ sentTrade }, { recieverId }) => {
          const { reciever } = sentTrade;
          return reciever === recieverId;
        }
      ),
    },
    acceptedTrade: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("ACCEPTED_TRADE"),
        ({ acceptedTrade }, { senderId }) => {
          const { sender } = acceptedTrade;
          return sender === senderId;
        }
      ),
    },
    sentFriendRequest: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("SENT_FRIEND_REQUEST"),
        ({ sentFriendRequest }, { recieverId }) => {
          const { reciever } = sentFriendRequest;
          return reciever === recieverId;
        }
      ),
    },
    acceptedFriendRequest: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("ACCEPTED_FRIEND_REQUEST"),
        ({ acceptedFriendRequest }, { senderId }) => {
          const { sender } = acceptedFriendRequest;
          return sender === senderId;
        }
      ),
    },
  },
};

export default resolvers;
