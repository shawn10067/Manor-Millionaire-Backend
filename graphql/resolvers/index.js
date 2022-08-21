import { config } from "dotenv";
const { parsed: envConfig } = config();
import mutations from "./mutations.js";
import queries from "./queries.js";
import subscriptions from "./subscriptions.js";
import types from "./types.js";
import lodashPkg from "lodash";
const { merge } = lodashPkg;

const resolvers = merge(mutations, queries, subscriptions, types);

export default resolvers;
