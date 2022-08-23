import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const postBail = async () => {
  await prisma.user.updateMany({
    data: {
      isBail: true,
    },
    where: {
      isBail: false,
    },
  });
};

export default postBail;
