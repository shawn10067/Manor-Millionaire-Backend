import { PrismaClient } from "@prisma/client";
import properties from "../graphql/mock/properties.js";
import dbUsers from "../graphql/mock/users.js";
import { makeMillion } from "../graphql/utils/money.js";

export const prisma = new PrismaClient();

// add all the properties to the database
const addProperties = async () => {
  for (let i = 0; i < properties.length; i++) {
    const currentProperty = properties[i];
    const {
      country,
      address,
      imageUrl,
      price,
      income,
      propertyValue,
      cost,
      status,
      frozen,
    } = currentProperty;

    const { alone, set, tier1, tier2 } = income;
    const { tier1Cost, tier2Cost } = cost;

    await prisma.property.create({
      data: {
        country,
        address,
        imageUrl,
        price,
        aloneIncome: alone,
        setIncome: set,
        tier1Income: tier1,
        tier2Income: tier2,
        propertyValue,
        tier1Cost,
        tier2Cost,
      },
    });
  }
};

const addUsers = async () => {
  // add all the users from dbUser to the database
  for (let i = 0; i < dbUsers.length; i++) {
    const currentUser = dbUsers[i];
    const {
      id: fireBaseId,
      username,
      password,
      cash,
      properties,
      friends,
      trades,
    } = currentUser;
    const propertyIds = properties.map((property) => {
      return {
        id: property.id,
      };
    });
    const friendIds = friends.map((friend) => {
      id: friend.id;
    });

    await prisma.user.create({
      data: {
        username,
        cash: makeMillion(Math.floor(Math.random() * 1000000)),
        fireBaseId: fireBaseId,
        myFriends: {
          create: [],
        },
        friendsWithMe: {
          connect: [],
        },
        properties: {
          create: [],
        },
        sentTrades: {
          create: [],
        },
        recievedTrades: {
          create: [],
        },
      },
    });

    // get the current user from the database
    const currentDbUser = await prisma.user.findUnique({
      where: {
        fireBaseId: fireBaseId,
      },
    });

    // getting id of the current user
    const currentUserId = currentDbUser.id;

    // connect each property id to the user via properties on users
    for (let j = 0; j < propertyIds.length; j++) {
      const currentProperty = propertyIds[j];
      await prisma.propertiesOnUsers.create({
        data: {
          user: {
            connect: {
              id: currentUserId,
            },
          },
          property: {
            connect: {
              id: currentProperty.id,
            },
          },
        },
      });
    }
  }
};

const getProperties = async () => {
  //const deleteProp = await prisma.property.deleteMany({});
  const dbProperties = await prisma.property.findMany({});
};

export default prisma;
