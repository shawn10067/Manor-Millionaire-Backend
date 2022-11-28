import prisma from "./db.js";

const deleteUser = async (firebaseId) => {
  await prisma.user.delete({
    where: {
      fireBaseId: firebaseId,
    },
  });
};

const getAllUser = async () => {
  const users = await prisma.user.findMany();
  const spinSortedUsers = users.sort((a, b) => {
    a.lastSpin > b.lastSpin;
  });
  console.log(spinSortedUsers);
  return users;
};

const getUserWithUsername = async (username) => {
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
    include: {
      properties: true,
      friendsWithMe: true,
    },
  });
  console.log("user", user);
  return user;
};

const deleteAllTrades = async () => {
  const allTrades = await prisma.tradesOnUsers.findMany();
  console.log("allTrades", allTrades);
  await prisma.tradesOnUsers.deleteMany();
};

// getUserWithUsername("jesus");
// deleteAllTrades();

//deleteUser("ZPS4kyIjbUYPSQeLvHWS339U20u2");

// give all properties to user "capstar"
const giveAllPropertiesToUser = async (username) => {
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  const allProperties = await prisma.property.findMany();
  const allPropertiesIds = allProperties.map((property) => {
    return { id: property.id };
  });
  const newPropertyIds = [];

  for (let i = 0; i < allPropertiesIds.length; i++) {
    const propertyId = allPropertiesIds[i];
    const property = await prisma.property.findUnique({
      where: {
        id: propertyId.id,
      },
    });
    if (property) {
      console.log("property", property);
      newPropertyIds.push(propertyId);
    }
  }
  console.log("newPropertyIds", newPropertyIds);
  for (let i = 0; i < newPropertyIds.length; i++) {
    const propertyId = newPropertyIds[i];
    await prisma.propertiesOnUsers.create({
      data: {
        propertyId: propertyId.id,
        userId: user.id,
      },
    });
  }
};

// giveAllPropertiesToUser("capstar");
getUserWithUsername("capstar");
