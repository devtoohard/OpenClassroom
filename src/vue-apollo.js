import Vue from "vue";
import VueApollo from "vue-apollo";
import {
  createApolloClient,
  restartWebsockets
} from "vue-cli-plugin-apollo/graphql-client";
import { onError } from "apollo-link-error";
import auth from "@/auth";

// Install the vue plugin
Vue.use(VueApollo);

// Name of the localStorage item
const AUTH_TOKEN = "AUTH_TOKEN";

// Http endpoint
const httpEndpoint = process.env.VUE_APP_GRAPHQL_HTTP;

const logoutLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) {
    for (var { message } of graphQLErrors) {
      if (message == "Could not verify JWT: JWTExpired") {
        auth.logoutWithSessionExpiryMessage();
        break;
      }
    }
  }
  // if (networkError && networkError.statusCode === 401) {
  //   auth.logout();
  // }
});

// Config
const defaultOptions = {
  // You can use `https` for secure connection (recommended in production)
  httpEndpoint,
  // You can use `wss` for secure connection (recommended in production)
  // Use `null` to disable subscriptions
  // wsEndpoint: process.env.VUE_APP_GRAPHQL_WS || "ws://localhost:4000/graphql",
  wsEndpoint: null,
  // LocalStorage token
  tokenName: AUTH_TOKEN,
  // Enable Automatic Query persisting with Apollo Engine
  persisting: false,
  // Use websockets for everything (no HTTP)
  // You need to pass a `wsEndpoint` for this to work
  websocketsOnly: false,
  // Is being rendered on the server?
  ssr: false,

  // Override default apollo link
  // note: don't override httpLink here, specify httpLink options in the
  // httpLinkOptions property of defaultOptions.
  // link: myLink
  link: logoutLink,

  // Override default cache
  // cache: myCache

  // Override the way the Authorization header is set
  getAuth: tokenName => {
    // get the authentication token from local storage if it exists
    // return the headers to the context so httpLink can read them
    const token = localStorage.getItem(tokenName);
    if (token) {
      return "Bearer " + token;
    } else {
      return "";
    }
  }

  // Additional ApolloClient options
  // apollo: { ... }

  // Client local data (see apollo-link-state)
  // clientState: { resolvers: { ... }, defaults: { ... } }
};

// Call this in the Vue app file
export function createProvider(options = {}) {
  // Create apollo client
  const { apolloClient, wsClient } = createApolloClient({
    ...defaultOptions,
    ...options
  });
  apolloClient.wsClient = wsClient;

  // Create vue apollo provider
  const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
    defaultOptions: {
      $query: {
        // fetchPolicy: 'cache-and-network',
      }
    }
    // errorHandler(error) {
    // eslint-disable-next-line no-console
    // console.log(
    //   "%cError",
    //   "background: red; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;",
    //   error.message
    // );
    // }
  });

  return apolloProvider;
}

// Manually call this when user log in
export async function onLogin(apolloClient, token) {
  if (typeof localStorage !== "undefined" && token) {
    localStorage.setItem(AUTH_TOKEN, token);
  }
  if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient);
  try {
    await apolloClient.resetStore();
  } catch (e) {
    // eslint-disable-next-line no-console
    // console.log("%cError on cache reset (login)", "color: orange;", e.message);
  }
}

// Manually call this when user log out
export async function onLogout(apolloClient) {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN);
  }
  if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient);
  try {
    await apolloClient.resetStore();
  } catch (e) {
    // eslint-disable-next-line no-console
    // console.log("%cError on cache reset (logout)", "color: orange;", e.message);
  }
}
