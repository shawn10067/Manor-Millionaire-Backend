import prisma from "./db.js";

const deleteUser = async (firebaseId) => {
  await prisma.user.delete({
    where: {
      fireBaseId: firebaseId,
    },
  });
};

deleteUser("N6hR59gi6LfIBe5dNvVye7jyaEF2");
