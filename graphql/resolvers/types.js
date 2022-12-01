import prisma from "../../prisma/db.js";

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
          myFriends: true
        },
      });
      return user.myFriends;
    },
    cash: async (parent) => {
      return parseFloat(parent.cash);
    },
    lastSpin: async (parent) => {
      const { lastSpin } = parent;
      return lastSpin;
    },
  },
  Trade: {
    recieverUser: async ({ recieverId }, args, ctx) => {
      const userFromDB = await prisma.user.findUnique({
        where: {
          id: recieverId,
        },
      });
      return userFromDB;
    },
    senderUser: async ({ senderId }, args, ctx) => {
      const forUserFromDB = await prisma.user.findUnique({
        where: {
          id: senderId,
        },
      });
      return forUserFromDB;
    },
    recieverProperties: async (parent, args, ctx) => {
      const { id } = parent;

      const requestedTrade = await prisma.tradesOnUsers.findUnique({
        where: {
          id,
        },
        include: {
          recieverProperties: {
            include: {
              property: true,
            },
          },
        },
      });

      const { recieverProperties } = requestedTrade;
      return recieverProperties;
    },
    senderProperties: async (parent, args, ctx) => {
      const { id } = parent;

      const requestedTrade = await prisma.tradesOnUsers.findUnique({
        where: {
          id,
        },
        include: {
          senderProperties: {
            include: {
              property: true,
            },
          },
        },
      });

      const { senderProperties } = requestedTrade;
      return senderProperties;
    },
    senderCash: async ({ senderCash }, args, ctx) => {
      return parseInt(senderCash);
    },
    recieverCash: async ({ recieverCash }, args, ctx) => {
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
