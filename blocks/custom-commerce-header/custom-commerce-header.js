import { Header, provider as uiProvider } from '@dropins/tools/components.js';
import { readBlockConfig } from '../../scripts/aem.js';

export default function decorate(block) {

  console.log(readBlockConfig(block));
  const {
    title = 'My Custom Header',
  } = readBlockConfig(block);

  block.innerHTML = '';

  return uiProvider.render(Header, { title })(block);
}