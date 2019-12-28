import $ from 'jquery';

function handleSubmit(e) {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target));
  for (const name of ['useMultipleSegments', 'showLabels']) {
    formData[name] = formData[name] === 'on';
  }

  for (const name of ['latitude', 'longitude', 'radius', 'numRings']) {
    formData[name] = Number.parseFloat(formData[name]);
  }

  console.log(formData);
}

export default function gridForm(element) {
  $(element).on('submit', handleSubmit);
}
