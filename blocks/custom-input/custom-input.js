export default function decorate(block) {

const form = document.createElement('form');
form.id = 'checkoutForm';
form.innerHTML = `
<label>First Name
<input type="text" name="firstname" required />
</label>
<br>
<label>Last Name
<input type="text" name="lastname" required />
</label>
<br>
<button type="submit">Submit</button>
`;

block.appendChild(form);

}