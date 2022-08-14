import createUsers from "../mock/createUsers.js";
import { makeMillion } from "../utils/money.js";

const users = createUsers();

// create resolvers for the graphql schema based on the graphql typedefs and the 'users' mock data above
const resolvers = {
  Query: {
    login: (_, { username, password }) => {
      const user = users.find((user) => user.username === username);
      if (user && user.password === password) {
        return user.id;
      }
      return null;
    },
    searchUsers: (_, { searchString }) => {
      return users.filter((user) =>
        user.username.toLowerCase().includes(searchString.toLowerCase())
      );
    },
    getMe: (_, __, { user }) => {
      return users.find((u) => u.id === user);
    },
    getUser: (_, { username }) => {
      return users.find((u) => u.username === username);
    },
    spin: () => {
      const spin = Math.floor(Math.random() * 100);
      if (spin < 33) {
        return "JAIL";
      } else if (spin < 66) {
        return "GET";
      } else {
        return "LAND";
      }
    },
    getRandomProperty: () => {
      return properties[Math.floor(Math.random() * properties.length)];
    },
    landRandomProperty: () => {
      return properties[Math.floor(Math.random() * properties.length)];
    },
  },
  Mutation: {
    signUp: (_, { firebaseToken, username }) => {
      const user = users.find((user) => user.username === username);
      if (user) {
        return "USER_EXISTS";
      } else {
        return "NEW_USER";
      }
    },
    acceptProperty: (_, { propertyID }) => {
      return properties.find((property) => property.id === propertyID);
    },
    landCash: (_, { propertyOwner, cash }) => {
      return properties.find((property) => property.id === propertyOwner);
    },
    sendTrade: (
      _,
      {
        theirUserId,
        propertiesYouWant,
        cashYouWant,
        propertiesGiving,
        cashGiving,
      }
    ) => {
      return {
        id: Math.floor(Math.random() * 1000000),
        theirUserId,
        propertiesYouWant,
        cashYouWant,
        propertiesGiving,
        cashGiving,
      };
    },
    bankTrade: (_, { propertiesGiving, cashGiving }) => {
      makeMillion(Math.floor(Math.random() * 1000000));
    },
    acceptTrade: (_, { tradeId }) => {
      // return random trade from a random user
      return users[Math.floor(Math.random() * users.length)].trades[
        Math.floor(
          Math.random() *
            users[Math.floor(Math.random() * users.length)].trades.length
        )
      ];
    },
    sendFriendRequest: (_, { userId }) => {
      return users.find((user) => user.id === userId);
    },
    acceptFriendRequest: (_, { userId }) => {
      return users.find((user) => user.id === userId);
    },
    inAppPurchase: (_, { productId }) => {
      return "PURCHASED";
    },
  },
};

export default resolvers;
