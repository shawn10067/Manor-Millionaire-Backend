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
    GET_PROPERTY
    PAY_BILLS
  }
`;

export default typeDefs;
