import prisma from "../../prisma/db.js";
import { config } from "dotenv";
const { parsed: envConfig } = config();

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
    cash: async (parent) => {
      return parseInt(parent.cash);
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
    theirProperties: async (parent, args, ctx) => {
      const propertyIds = parent.recieverProperties.map((property) => {
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
    recievingCash: async ({ senderCash }, args, ctx) => {
      return parseInt(senderCash);
    },
    requestedCash: async ({ recieverCash }, args, ctx) => {
      return parseInt(recieverCash);
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
