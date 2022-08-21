import { AuthenticationError } from "apollo-server";

export const authChecker = (ctx) => {
  const { user } = ctx;
  if (!user) {
    throw new AuthenticationError("Not authenticated");
  }
  return !!user;
};
