import { config } from "dotenv";
const { parsed: devEnv } = config();

const envConfig = devEnv || process.env;

export default envConfig;
