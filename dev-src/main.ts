import { myFunction } from '../src';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;

const content = myFunction();

app.innerHTML = `
  <h1>${content}</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`;
