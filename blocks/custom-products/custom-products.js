export default async function decorate(block) { 
 
 const API = "https://test-t6dnbai-wovgsanaa66gw.us-4.magentosite.cloud/graphql";
 
  const resultDisplay = document.createElement('pre');
  resultDisplay.style.backgroundColor = '#f5f5f5';
  resultDisplay.style.padding = '1em';
  resultDisplay.style.whiteSpace = 'pre-wrap';
  block.appendChild(resultDisplay);


 const query = `
 query {
  products(search: "Yoga pants", pageSize: 5) {
    total_count
    items {
      name
      sku
      price_range {
        minimum_price {
          regular_price {
            value
            currency
          }
        }
      }
    }
    page_info {
      page_size
      current_page
    }
  }
 }`;

document.addEventListener("load", async function(){
    try{
        const res = await fetch(API,{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query }),
      });

      const data = res.json();

      data.errors ? resultDisplay.textContent = `${t.error}\n${JSON.stringify(data.errors, null, 2)}` : resultDisplay.textContent = `${t.success}\n${JSON.stringify(data.data, null, 2)}`;;

    }catch(err){
        resultDisplay.textContent = `${t.networkError} ${error.message}`;
    }
});

}