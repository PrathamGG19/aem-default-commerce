/* eslint-disable import/no-cycle */
import { deepmerge } from '@dropins/tools/lib.js';
import {token, customerToken} from '../../scripts/auth.js';

// Private state
let config = null;
let rootPath = null;
let rootConfig = null;

/**
 * Builds the URL for the config file.
 *
 * @returns {URL} - The URL for the config file.
 */
function buildConfigURL() {
  return new URL(`${window.hlx.codeBasePath}/config.json`,window.location);
}

/**
 * Retrieves a value from a config object using dot notation.
 *
 * @param {Object} obj - The config object.
 * @param {string} key - The key to retrieve (supports dot notation).
 * @returns {any} - The value of the key.
 */
function getValue(obj, key) {
  return key.split('.').reduce((current, part) => {
    if (!Object.prototype.hasOwnProperty.call(current, part)) {
      console.warn(`Property ${key} does not exist in the object`);
      return undefined;
    }
    return current[part];
  }, obj);
}

/**
 * Get cookie
 * @param {string} cookieName - The name of the cookie to get
 * @returns {string} - The value of the cookie
 */
function getCookie(cookieName) {
  const cookies = document.cookie.split(';');
  let foundValue;
  console.log("Cookies:", cookies);

  cookies.forEach((cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name === cookieName) {
      foundValue = decodeURIComponent(value);
    }
  });

  return foundValue;
}

/**
 * Get root path
 * @param {Object} [configObj=config] - The config object.
 * @returns {string} - The root path.
 */
function getRootPath(configObj = config) {
  if (!configObj) {
    console.warn('No config found. Please call initializeConfig() first.');
    return '/';
  }

  const value = Object.keys(configObj?.public)
    // Sort by number of non-empty segments to find the deepest path
    .sort((a, b) => {
      const aSegments = a.split('/').filter(Boolean).length;
      const bSegments = b.split('/').filter(Boolean).length;
      return bSegments - aSegments;
    })
    .find((key) => window.location.pathname === key || window.location.pathname.startsWith(key));

  rootPath = value ?? '/';

  if (!rootPath.startsWith('/') || !rootPath.endsWith('/')) {
    throw new Error('Invalid root path');
  }

  return rootPath;
}

/**
 * Get list of root paths from public config
 * @returns {Array} - The list of root paths.
 */
function getListOfRootPaths() {
  if (!config) {
    console.warn('No config found. Please call initializeConfig() first.');
    return [];
  }

  return Object.keys(config?.public).filter((root) => root !== 'default');
}

/**
 * Checks if the public config contains more than "default"
 * @returns {boolean} - true if public config contains more than "default"
 */
function isMultistore() {
  return getListOfRootPaths().length >= 1;
}

/**
 * Retrieves headers from config entries like commerce.headers.pdp.my-header, etc and
 * returns as object of all headers like { my-header: value, ... }
 * @param {string} scope - The scope of the headers to retrieve.
 * @returns {Object} - The headers.
 */
function getHeaders(scope) {
  console.log("getHeaders called with scope:", scope);
  if (!rootConfig) {
    throw new Error('Configuration not initialized. Call initializeConfig() first.');
  }
  const headers = rootConfig.headers ?? {};
  console.log("headers  ");
 // console.log(localStorage.getItem("accessToken"));
 // console.log(localStorage.getItem("idaToken"));

 console.log(headers);
 //console.log(idToken);

 if(token?.accessToken && token?.idToken) {
   headers.accessToken = token.accessToken;
   headers.idToken = token.idToken;
 }

 if(customerToken) {
  console.log("Customer Token:", customerToken);
   headers.customer_token = customerToken;
 }

//  console.log("Cookie:", getCookie('customer_token'));

//  if(getCookie('customer_token')) {
//    headers.customer_token = getCookie('customer_token');    
//  }

  // if(localStorage.getItem("accessToken") && localStorage.getItem("idToken")) {
  //   headers.accessToken = localStorage.getItem("accessToken") || "";
  //   headers.idToken = localStorage.getItem("idToken") || "";
  // }

  console.log("Headers after adding accessToken and idToken:", headers);

  if (headers.customer_token) {
    console.log("Headers customer token")
      return {
        ...(headers.all || headers[scope]) ?? {
        "customer_token": headers.customer_token,
      },
      ...(headers.all ?? {}),
      ...(headers[scope] ?? {"customer_token": headers.customer_token}),
      };
    } else {
      console.log(" else Headers customer token");
     return {
      ...(headers.all || headers[scope]) ?? {
        "access_token": headers.accessToken,
        "id_token": headers.idToken,
      },
      ...(headers.all ?? {}),
      ...(headers[scope] ?? {"access_token": headers.accessToken, "id_token": headers.idToken}),
    }; 
    }
}

/**
 * Checks if the user is authenticated
 * @returns {boolean} - true if the user is authenticated
 */
function checkIsAuthenticated() {
  return !!getCookie('auth_dropin_user_token') ?? false;
}

/**
 * Applies config overrides from metadata.
 *
 * @param {Object} [configObj=config] - The base config.
 * @param {string} [root=rootPath] - The root path.
 * @returns {Object} - The config with overrides applied.
 */
async function applyConfigOverrides(configObj = config, root = rootPath) {
  if (!configObj) {
    throw new Error('Configuration not initialized. Call initializeConfig() first.');
  }

  const defaultConfig = configObj.public?.default;

  if (!defaultConfig) {
    throw new Error('No "default" config found.');
  }

  const current = deepmerge(
    defaultConfig,
    root === '/' ? defaultConfig : configObj.public[root] || defaultConfig,
  );

  return current;
}

/**
 * Fetches config from remote and saves in session, then returns it, otherwise
 * returns if it already exists.
 *
 * @returns {Promise<Object>} - The config JSON from session storage
 */
async function getConfigFromSession() {
  try {
    const configJSON = window.sessionStorage.getItem('config');
    if (!configJSON) {
      throw new Error('No config in session storage');
    }

    const parsedConfig = JSON.parse(configJSON);
    if (!parsedConfig[':expiry'] || parsedConfig[':expiry'] < Math.round(Date.now() / 1000)) {
      throw new Error('Config expired');
    }
    return parsedConfig;
  } catch (e) {
    let configJSON = await fetch(buildConfigURL());
    if (!configJSON.ok) {
      throw new Error('Failed to fetch config');
    }
    configJSON = await configJSON.json();
    configJSON[':expiry'] = Math.round(Date.now() / 1000) + 7200;
    // console.log("Config");
    // console.log(configJSON);
    // console.log(localStorage.getItem("accessToken"));
    // console.log(localStorage.getItem("idToken"));
    
    let accessToken, idToken;

    // if(localStorage.getItem("accessToken") && localStorage.getItem("idToken")) {
    //   accessToken = localStorage.getItem("accessToken") || "";
    //   idToken = localStorage.getItem("idToken") || "";
    //   configJSON.public.default.headers.accessToken = accessToken;
    //   configJSON.public.default.headers.idToken = idToken;
    // }
    // console.log("configJSON after ");
    // console.log(configJSON);
    window.sessionStorage.setItem('config', JSON.stringify(configJSON));
    return configJSON;
  }
}

/**
 * Initializes the configuration system.
 * @returns {Promise<void>}
 */
async function initializeConfig() {
  config = await getConfigFromSession();
  rootPath = getRootPath(config);
  rootConfig = await applyConfigOverrides(config, rootPath);
}

/**
 * Retrieves a configuration value.
 *
 * @param {string} configParam - The configuration parameter to retrieve.
 * @returns {string|undefined} - The value of the configuration parameter, or undefined.
 */
function getConfigValue(configParam) {
  if (!rootConfig) {
    throw new Error('Configuration not initialized. Call initializeConfig() first.');
  }
  return getValue(rootConfig, configParam);
}

export {
  initializeConfig,
  getCookie,
  getRootPath,
  getListOfRootPaths,
  isMultistore,
  getConfigValue,
  getHeaders,
  checkIsAuthenticated,
};
