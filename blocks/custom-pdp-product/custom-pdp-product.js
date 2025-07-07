
function createProduct($block, props = {}){
    console.log("Create Product called")
    const product = props?.product || {};
    const title = product.title || 'No Title';
    const sku = product.sku || 'No SKU';
    const price = product.price || '0';
    // const description = product.description || ' ';
    console.log(title+" "+sku+" "+price)
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

export default decorate('product', createProduct);
