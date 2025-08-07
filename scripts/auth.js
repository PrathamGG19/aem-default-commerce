import { getConfigValue, getHeaders } from "../../scripts/configs.js";

// The Auth0 client, initialized in configureClient()

let auth0Client = null;

export let isAuthenticatedFlag = false;

export let token, customerToken;

const myQuery = `
  mutation {
    login(input: {
      input: {
        query: "mutation { generateCustomerToken( email: \\"aambekar@deloitte.com\\",password: \\"Admin@123\\") { token } }",
        variables: {}
      }
    })
  }
`;


/** 

 * Starts the authentication flow 

 */

export const login = async (targetUrl) => {
  try {
    console.log("Logging in", targetUrl);

    const endpoint = getConfigValue("commerce-endpoint");
    console.log("Commerce endpoint:", endpoint);

    const options = {
      authorizationParams: {
        redirect_uri: "http://localhost:3000",
      },

      cookieStorage: "localhost",

      cookieDomain: "localhost",
    };

    if (targetUrl) {
      options.appState = { targetUrl };
    }

    await auth0Client.loginWithRedirect(options);
  } catch (err) {
    console.log("Log in failed", err);
  }
};

/** 

 * Executes the logout flow 

 */

export const logout = async () => {
  try {
    console.log("Logging out");

    // await auth0Client.logout({
    //   logoutParams: {
    //     returnTo: "http://localhost:4000",
    //   },
    // });

    let result = await callGraphQLAPI(getConfigValue("commerce-endpoint"), myQuery, {}, token);

    console.log("result:", result);

    customerToken = result.data.login.customer_token;

    console.log("Customer Token:", customerToken);
    
  } catch (err) {
    console.log("Log out failed", err);
  }
};

/** 

 * Retrieves the auth configuration from the server 

 */

// const fetchAuthConfig = () => fetch("/auth_config.json");

/** 

 * Initializes the Auth0 client 

 */

const configureClient = async () => {
  // const response = await fetchAuthConfig();

  // const config = await response.json();

  const domainID = getConfigValue("authtoken.domain");

  const clientID = getConfigValue("authtoken.clientId");

  auth0Client = await window.auth0.createAuth0Client({
    domain: domainID,
    clientId: clientID,
    cacheLocation: "localstorage",
    // //connection: 'Username-Password-Authentication',

    // authorizationParams: {

    //   redirect_uri: `${window.location.origin}/`,

    // },

    //cacheLocation: 'localstorage', // Store tokens in local storage

    // useRefreshTokens: true, // Enable refresh tokens
  });
};

/** 

 * Checks to see if the user is authenticated. If so, `fn` is executed. Otherwise, the user 

 * is prompted to log in 

 * @param {*} fn The function to execute if the user is logged in 

 */

// const requireAuth = async (fn, targetUrl) => {

//   const isAuthenticated = await auth0Client.isAuthenticated();

//   if (isAuthenticated) {

//     return fn();

//   }

//   return login(targetUrl);

// };

// Will run when page finishes loading

window.onload = async () => {
  await configureClient();

  // If unable to parse the history hash, default to the root URL

  //   if (!showContentFromUrl(window.location.pathname)) {

  //     showContentFromUrl("/");

  //     window.history.replaceState({ url: "/" }, {}, "/");

  //   }

  //   const bodyElement = document.getElementsByTagName("body")[0];

  //   // Listen out for clicks on any hyperlink that navigates to a #/ URL

  //   bodyElement.addEventListener("click", (e) => {

  //     if (isRouteLink(e.target)) {

  //       const url = e.target.getAttribute("href");

  //       if (showContentFromUrl(url)) {

  //         e.preventDefault();

  //         window.history.pushState({ url }, {}, url);

  //       }

  //     }

  //   });

  const isAuthenticated = await auth0Client.isAuthenticated();

  if (isAuthenticated) {
    console.log("> User is authenticated");

    isAuthenticatedFlag = isAuthenticated;

    window.history.replaceState({}, document.title, window.location.pathname);

    console.log("User is authenticated, getting user details");

    let { accessToken, idToken } = await getAuth0Token();
    token = { accessToken, idToken };

    let result = await callGraphQLAPI(getConfigValue("commerce-endpoint"), myQuery, {}, token);

    console.log("result:", result);

    customerToken = result.data.login.customer_token;

    console.log("Customer Token:", customerToken);
   

    const user = await auth0Client.getUser();

    console.log("User details 1:", user);

    // updateUI();

    return;
  }

  console.log("> User not authenticated");

  const query = window.location.search;

  const shouldParseResult = query.includes("code=") && query.includes("state=");

  if (shouldParseResult) {
    console.log("> Parsing redirect");

    try {
      const result = await auth0Client.handleRedirectCallback();

      const redirectUrl = sessionStorage.getItem("redirectUrl") || "/";

      if (result.appState && result.appState.targetUrl) {
        // showContentFromUrl(result.appState.targetUrl);

        console.log("Redirected to:", result.appState.targetUrl);
      }

      console.log("Logged in!");


      const user = await auth0Client.getUser();
      // const idToken = await auth0.getIdTokenClaims();

     // const ida = result.idToken;

      // localStorage.setItem("idaToken", ida);
      // console.log('ID Token:', idToken.__raw);

      let {accessToken, idaToken} = await getAuth0Token();
      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("idaToken", idaToken)

      console.log("Auth0", auth0Client);
      console.log("User details 2:", user);
     // console.log("IDA Token:", ida);
    } catch (err) {
      console.log("Error parsing redirect:", err);
    }

    window.history.replaceState({}, document.title, "/");
  }

  //Declare helper functions

  // updateUI();
};

const getAuth0Token = async function() {
            try {
                const accessToken = await auth0Client.getTokenSilently();
                const claims = await auth0Client.getIdTokenClaims();
                const idToken = claims.__raw;
                 
               // console.log("Access Token:", accessToken);
               // console.log("Claims:", claims);
                return {accessToken, idToken};
            } catch (error) {
                console.error("Error getting token:", error);
                return null;
            }
        }

async function callGraphQLAPI(endpoint, query, variables = {}, token) {
  console.log("Calling GraphQL API:", endpoint);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        access_token: token.accessToken,
        id_token: token.idToken,
      },
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
      // credentials: "include"
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}, errors: ${JSON.stringify(errorData.errors)}`);
    }

    const head = await response.headers;
    console.log("Header:", head);

    const data = await response.json();
    const customerT = await response.headers.get('customer-token');
    //const customerT = await response.getAllResponseHeaders().toLowerCase();
    console.log("Headers get:", customerT);
    return data;
  } catch (error) {
    console.error('Error calling GraphQL API:', error);
    throw error;
  }
}


