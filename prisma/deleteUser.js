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

deleteUser("ZPS4kyIjbUYPSQeLvHWS339U20u2");
