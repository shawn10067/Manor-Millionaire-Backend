import users from "../mock/users.js";
import { makeMillion } from "../utils/money.js";
import pubsub from "../utils/pubsub.js";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
const prisma = new PrismaClient();
const { parsed: envConfig } = config();

// create resolvers for the graphql schema based on the graphql typedefs and the 'users' mock data above
const resolvers = {
  Property: {
    income: (parent) => {
      const { aloneIncome, setIncome, tier1Income, tier2Income } = parent;
      return {
        alone: aloneIncome,
        set: setIncome,
        tier1: tier1Income,
        tier2: tier2Income,
      };
    },
    cost: (parent) => {
      const { tier1Cost, tier2Cost } = parent;
      return {
        tier1Cost,
        tier2Cost,
      };
    },
  },
  UserProperty: {
    status: (parent) => {
      const { status } = parent;
      return status.toUpperCase();
    },
    property: async (parent) => {
      const { id } = parent;
      const userProperty = await prisma.propertiesOnUsers.findUnique({
        where: {
          id,
        },
        include: {
          property: true,
        },
      });
      return userProperty.property;
    },
    user: async (parent) => {
      const { id } = parent;
      const userProperty = await prisma.propertiesOnUsers.findUnique({
        where: {
          id,
        },
        include: {
          user: true,
        },
      });
      return userProperty.user;
    },
  },
  User: {
    properties: async (parent) => {
      const properties = await prisma.propertiesOnUsers.findMany({
        where: {
          userId: parent.id,
        },
        include: {
          property: true,
        },
      });

      if (properties) {
        return properties;
      } else {
        return [];
      }
    },
    trades: async (parent) => {
      const trades = await prisma.tradesOnUsers.findMany({
        where: {
          recieverId: parent.id,
        },
        include: {
          senderUser: true,
          recieverUser: true,
          senderProperties: true,
          recieverProperties: true,
        },
      });

      if (trades) {
        return trades;
      } else {
        return [];
      }
    },
    friendRequests: async (parent) => {
      const friendRequests = await prisma.friendRequest.findMany({
        where: {
          userId: parent.id,
        },
        include: {
          requestUser: true,
          user: true,
        },
      });

      if (friendRequests) {
        return friendRequests;
      } else {
        return [];
      }
    },
    friends: async (parent) => {
      const user = await prisma.user.findUnique({
        where: {
          id: parent.id,
        },
        include: {
          myFriends: true,
        },
      });
      return user.myFriends;
    },
  },
  Query: {
    login: async (_, { username, password }) => {
      // change login to use firebase instead, and then get the profile token based on firebase id
      const user = await prisma.user.findUnique({
        where: {
          username: username,
        },
        include: {
          properties: true,
        },
      });

      if (user && password === "password") {
        return jwt.sign(user, envConfig.JWT_SECRET);
      } else {
        return "no such user";
      }
    },
    searchUsers: async (_, { searchString }) => {
      pubsub.publish("SEARCHED_USERS", {
        searchedUsers: searchString,
      });
      const lowerCaseSearchString = searchString.toLowerCase();
      const results = await prisma.user.findMany({
        where: {
          username: {
            contains: lowerCaseSearchString,
            mode: "insensitive",
          },
        },
        take: 8,
      });
      return results;
    },
    getMe: (_, args, ctx) => {
      return ctx.user;
    },
    getUser: async (_, { username }) => {
      const user = await prisma.user.findUnique({
        where: {
          username: username,
        },
      });
      return user;
    },
    getUserId: async (_, { id }) => {
      const user = await prisma.user.findUnique({
        where: {
          id: id,
        },
      });
      return user;
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
    getRandomProperty: async () => {
      // get the property count from the database
      const propertyCount = await prisma.property.count();

      // get a random property based on a random number between 0 and the property count
      const randomProperty = await prisma.property.findFirst({
        skip: Math.floor(Math.random() * propertyCount),
      });
      return randomProperty;
    },
    landRandomProperty: async () => {
      // get the user on property count from the database
      const userOnPropertyCount = await prisma.propertiesOnUsers.count();

      // get a random user on property based on a random number between 0 and the property count
      const randomUserOnProperty = await prisma.propertiesOnUsers.findFirst({
        skip: Math.floor(Math.random() * userOnPropertyCount),
      });

      return randomUserOnProperty;
    },
  },
  Mutation: {
    signUp: async (_, { firebaseId, username }) => {
      const newUser = await prisma.user.create({
        data: {
          username: username,
          cash: 200000000,
          fireBaseId: firebaseId,
          properties: {
            create: [],
          },
          friendsWithMe: {
            create: [],
          },
          myFriends: {
            create: [],
          },
          sentTrades: {
            create: [],
          },
          receivedTrades: {
            create: [],
          },
        },
      });
      return jwt.sign(newUser, envConfig.JWT_SECRET);
    },
    acceptProperty: async (_, { propertyID }, ctx) => {
      const { user } = ctx;
      const intPropertyId = parseInt(propertyID);
      console.log(user.id, intPropertyId);

      // if the user already has the property, return false
      const retrivedUser = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
        include: {
          properties: {
            include: {
              property: true,
            },
          },
        },
      });
      const userHasOne = retrivedUser.properties.some(({ property }) => {
        console.log(property.id, intPropertyId, user);
        return property.id === intPropertyId;
      });

      if (userHasOne) {
        console.log("user has one");
        return false;
      }

      const newUserProperty = await prisma.propertiesOnUsers.create({
        data: {
          user: {
            connect: {
              id: user.id,
            },
          },
          property: {
            connect: {
              id: intPropertyId,
            },
          },
        },
      });

      return true;
    },
    landCash: async (_, { propertyOwnerId, cash }, ctx) => {
      // TODO: make this into a transaction
      const { user } = ctx;
      const intPropertyOwnerId = parseInt(propertyOwnerId);
      const intCash = parseInt(cash);

      // subtract the cash from the user's cash
      const retrivedUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          cash: {
            decrement: intCash,
          },
        },
      });

      // add the cash to the property owner's cash
      await prisma.user.update({
        where: {
          id: intPropertyOwnerId,
        },
        data: {
          cash: {
            increment: intCash,
          },
        },
      });

      return retrivedUser;
    },
    sendTrade: async (
      _,
      {
        theirUserId,
        propertiesYouWant,
        cashYouWant,
        propertiesGiving,
        cashGiving,
      },
      ctx
    ) => {
      const { user } = ctx;
      const intTheirUserId = parseInt(theirUserId);
      const intCashYouWant = parseInt(cashYouWant);
      const intCashGiving = parseInt(cashGiving);

      // formatting the properties you want to get the id's of
      const propertiesYouWantWithIds = propertiesYouWant.map((propertyId) => {
        return {
          id: parseInt(propertyId),
        };
      });

      const propertiesGivingWithIds = propertiesGiving.map((propertyId) => {
        return {
          id: parseInt(propertyId),
        };
      });

      const newTrade = await prisma.tradesOnUsers.create({
        data: {
          senderUser: {
            connect: {
              id: user.id,
            },
          },
          recieverUser: {
            connect: {
              id: intTheirUserId,
            },
          },
          recieverProperties: {
            connect: propertiesYouWantWithIds,
          },
          recieverCash: intCashYouWant,
          senderProperties: {
            connect: propertiesGivingWithIds,
          },
          senderCash: intCashGiving,
        },
      });

      return newTrade;
    },
    bankTrade: async (_, { propertiesGiving }, ctx) => {
      // delete the properties (on users) giving from the user and add all the property values together and increment the user's cash by that amount
      makeMillion(Math.floor(Math.random() * 1000000));
    },
    acceptTrade: (_, { tradeId }) => {
      // ensure that all the right properties and cash amount exist and then update each user's cash and properties
      return users[Math.floor(Math.random() * users.length)].trades[
        Math.floor(
          Math.random() *
            users[Math.floor(Math.random() * users.length)].trades.length
        )
      ];
    },
    sendFriendRequest: async (_, { userId }, ctx) => {
      // getting user from context
      const { user } = ctx;

      const intUserId = parseInt(userId);

      // send a friend request to the user with the userId
      const newFriendRequest = await prisma.friendRequest.create({
        data: {
          requestUser: {
            connect: {
              id: user.id,
            },
          },
          user: {
            connect: {
              id: intUserId,
            },
          },
        },
      });

      console.log(newFriendRequest);

      return newFriendRequest;
    },
    acceptFriendRequest: async (_, { friendRequestId }, ctx) => {
      // TODO: make this into a transaction and delete the friend request from the database
      const { user } = ctx;
      const intFriendRequestId = parseInt(friendRequestId);

      // get the friend request
      const friendRequest = await prisma.friendRequest.findUnique({
        where: {
          id: intFriendRequestId,
        },
        include: {
          user: true,
          requestUser: true,
        },
      });

      // add friends to each user
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          myFriends: {
            connect: {
              id: friendRequest.requestUser.id,
            },
          },
        },
        include: {
          myFriends: true,
        },
      });

      await prisma.user.update({
        where: {
          id: friendRequest.requestUser.id,
        },
        data: {
          myFriends: {
            connect: {
              id: user.id,
            },
          },
        },
        include: {
          myFriends: true,
        },
      });
      return friendRequest;
    },
    inAppPurchase: (_, { productId }) => {
      // determine what the product is and then update the user appropriately
      return "PURCHASED";
    },
  },
  Subscription: {
    searchedUsers: {
      subscribe: () => pubsub.asyncIterator("SEARCHED_USERS"),
    },
  },
  Trade: {
    user: async ({ recieverId }, args, ctx) => {
      const userFromDB = await prisma.user.findUnique({
        where: {
          id: recieverId,
        },
      });
      return userFromDB;
    },
    fromUser: async ({ senderId }, args, ctx) => {
      const forUserFromDB = await prisma.user.findUnique({
        where: {
          id: senderId,
        },
      });
      return forUserFromDB;
    },
    recievingProperties: async ({ senderProperties }, args, ctx) => {
      const propertyIds = senderProperties.map((property) => {
        return property.id;
      });
      const propertiesFromDB = await prisma.propertiesOnUsers.findMany({
        where: {
          id: {
            in: propertyIds,
          },
        },
      });
      return propertiesFromDB;
    },
    theirProperties: async ({ recieverProperties }, args, ctx) => {
      const propertyIds = recieverProperties.map((property) => {
        return property.id;
      });
      const propertiesFromDB = await prisma.propertiesOnUsers.findMany({
        where: {
          id: {
            in: propertyIds,
          },
        },
      });
      return propertiesFromDB;
    },
    recievingCash: async ({ recieverCash }, args, ctx) => {
      return recieverCash;
    },
    requestedCash: async ({ senderCash }, args, ctx) => {
      return senderCash;
    },
  },
  FriendRequest: {
    user: async ({ userId }, args, ctx) => {
      const userFromDB = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      return userFromDB;
    },
    fromUser: async ({ requestUserId }, args, ctx) => {
      const userFromDB = await prisma.user.findUnique({
        where: {
          id: requestUserId,
        },
      });
      return userFromDB;
    },
  },
};

export default resolvers;
