export default function test() {
  const element = document.createElement('div');
  element.innerHTML = 'Hello world';
  document.body.appendChild(element);
  return element;
}
