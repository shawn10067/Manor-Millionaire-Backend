import { gql } from "apollo-server";

import types from "./types.js";
import mutations from "./mutations.js";
import queries from "./queries.js";
import subscriptions from "./subscriptions.js";
import enums from "./enums.js";

const typeDefs = gql`
  ${enums}
  ${types}
  ${mutations}
  ${queries}
  ${subscriptions}
`;

/*
 * notes:
 * user will have a firebase id in the table
 * it will be indexed based on pkey id and username
 * will have a many-to-many properties relationship
 * will have a many-to-many users relationship
 * will have a reset password option for firebase
 */

export default typeDefs;
