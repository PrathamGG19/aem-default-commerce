import * as mesh from '@dropins/tools/fetch-graphql.js';
import { initializers } from '@dropins/tools/initializer.js';
import * as pkg from '@dropins/storefront-cart/api.js';
import { render as provider } from '@dropins/storefront-cart/render.js';

import Cart from '@dropins/storefront-cart/containers/Cart.js';
import MiniCart from '@dropins/storefront-cart/containers/MiniCart.js';


//Commented GraphQL and Mesh API endpoint as it is pending
mesh.setEndpoint('https://<graphql-service-endpoint>/graphql');

// Set the customer token. This method is specific to @dropins/storefront-cart package.
pkg.setFetchGraphQlHeader('commerce-auth', '123456789');

// Set store code header. This method is specific to the @dropins/tools package.
mesh.setFetchGraphQlHeader('store', 'dummyHeader');

provider.render(Cart, {
  routeProduct: (item) => {
    return `${item.url.categories.join('/')}/${item.url.urlKey}`;
  },
  routeEmptyCartCTA: () => 'your-empty-cart-element',
  routeCheckout: () => 'your-checkout-element',
})(document.getElementById('your-cart-element'));

provider.render(MiniCart, {
  routeProduct: (item) => {
    return `${item.url.categories.join('/')}/${item.url.urlKey}`;
  },
  routeEmptyCartCTA: () => 'your-empty-cart-element',
  routeCart: () => 'your-cart-element',
  routeCheckout: () => 'your-checkout-element',
})(document.getElementById('your-mini-cart-element'));

