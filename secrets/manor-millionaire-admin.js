import envConfig from "../graphql/utils/envHelper.js";

const apiKey = {
  type: envConfig.G_TYPE,
  project_id: envConfig.G_PROJECT_ID,
  private_key_id: envConfig.G_PRIVATE_KEY_ID,
  private_key: envConfig.G_PRIVATE_KEY,
  client_email: envConfig.G_CLIENT_EMAIL,
  client_id: envConfig.G_CLIENT_ID,
  auth_uri: envConfig.G_AUTH_URI,
  token_uri: envConfig.G_TOKEN_URI,
  auth_provider_x509_cert_url: envConfig.G_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: envConfig.G_CLIENT_X509_CERT_URL,
};

export default apiKey;
