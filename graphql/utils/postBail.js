import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const postBail = async () => {
  await prisma.user.updateMany({
    where: {
      jailed: true,
    },
    data: {
      jailed: false,
    },
  });
};

export default postBail;
