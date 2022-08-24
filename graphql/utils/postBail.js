import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const postBail = async () => {
  const users = await prisma.user.findMany({});
  console.log(users);
  await prisma.user.updateMany({
    data: {
      jailed: true,
    },
  });
};

postBail();

export default postBail;
