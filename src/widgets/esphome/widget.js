import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    v1: {
      endpoint: "ping",
    },
    v2: {
      endpoint: "devices",
    },
  },
};

export default widget;
