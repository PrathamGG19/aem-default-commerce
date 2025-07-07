
function createProduct($block, props = {}){
    const product = props?.product || {};
    const title = product.title || 'No Title';
    const sku = product.sku || 'No SKU';
    const price = product.price || '0';
    // const description = product.description || ' ';

    const wrapper = document.createElement('div')
    wrapper.className = 'custom-pdp-product-banner'
    wrapper.innerHTML = `
    <p><strong>Custom PDP Product Component Block</strong></p>
    <p>Product Title: ${product.title}</p>
    <p>SKU: ${product.sku}</p>
    <p>Price: ${product.price}</p>
    `;

    $block.appendChild(wrapper);
}

decorate('product', createProduct);
