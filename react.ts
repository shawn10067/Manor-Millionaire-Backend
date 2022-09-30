
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "./graphql/typedefs/types.js",
  documents: "src/**/*.tsx",
  generates: {
    "src/gql": {
      preset: "client",
      plugins: []
    }
  }
};

export default config;
