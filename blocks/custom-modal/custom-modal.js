import createModal from '../modal/modal.js';

let modal;

export default async function decorate(block) { 

const showModal = async (content) => {
    modal = await createModal([content]);
    modal.showModal();
};

const button = document.createElement('button');
button.textContent = 'Open Modal';
button.addEventListener('click', () => {
    showModal('Hello, this is a custom modal!');
});

block.appendChild(button);

}