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
  });
  console.log("user", user);
  return user;
};

getUserWithUsername("jesus");

//deleteUser("ZPS4kyIjbUYPSQeLvHWS339U20u2");
