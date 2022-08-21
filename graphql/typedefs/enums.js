import { gql } from "apollo-server";

const typeDefs = gql`
  enum PropertyStatus {
    ALONE
    SET
    TIER1
    TIER2
  }

  enum SpinOutcome {
    JAIL
    GET
    LAND
  }
`;

export default typeDefs;
