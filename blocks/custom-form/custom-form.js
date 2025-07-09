export default function decorate(block) {
  const translations = {
    en: {
      firstname: 'First Name',
      lastname: 'Last Name',
      email: 'Email Address',
      password: 'Password',
      save: 'Save',
      success: '✅ Customer Created:',
      error: '❌ Error:',
      networkError: '⚠️ Network Error:',
    },
    // Add more locales here if needed
  };
 
  function getCurrentLocale() {
    return translations[document.documentElement.lang] ? document.documentElement.lang : 'en';
  }
 
  const t = translations[getCurrentLocale()];
 
  // Create Form
  const form = document.createElement('form');
  form.id = 'productInfoForm';
  form.innerHTML = `
<label>${t.firstname}
<input type="text" name="firstname" required />
</label>
<label>${t.lastname}
<input type="text" name="lastname" required />
</label>
<label>${t.email}
<input type="email" name="email" required />
</label>
<label>${t.password}
<input type="password" name="password" required />
</label>
<button type="submit">${t.save}</button>
  `;
  block.appendChild(form);
 
  // Create Output Display
  const resultDisplay = document.createElement('pre');
  resultDisplay.style.backgroundColor = '#f5f5f5';
  resultDisplay.style.padding = '1em';
  resultDisplay.style.whiteSpace = 'pre-wrap';
  block.appendChild(resultDisplay);
 
  // Submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
 
    const endpoint = 'https://edge-sandbox-graph.adobe.io/api/0804747e-2944-4ef2-b5f7-e1b7a1d6bc32/graphql';
    const token = 'f75115a1f5c64e61a50e050543da9545';
 
    const formData = new FormData(form);
    const firstname = formData.get('firstname');
    const lastname = formData.get('lastname');
    const email = formData.get('email');
    const password = formData.get('password');
 
    const query = `
      mutation {
        createCustomerV2(
          input: {
            firstname: "${firstname}"
            lastname: "${lastname}"
            email: "${email}"
            password: "${password}"
          }
        ) {
          customer {
            firstname
            lastname
            email
            is_subscribed
          }
        }
      }
    `;
 
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });
 
      const data = await response.json();
 
      if (data.errors) {
        resultDisplay.textContent = `${t.error}\n${JSON.stringify(data.errors, null, 2)}`;
      } else {
        resultDisplay.textContent = `${t.success}\n${JSON.stringify(data.data, null, 2)}`;
        form.reset();
      }
    } catch (error) {
      resultDisplay.textContent = `${t.networkError} ${error.message}`;
    }
  });
}