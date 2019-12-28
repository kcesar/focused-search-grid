import $ from 'jquery';

const NUMBER_FIELDS = ['latitude', 'longitude', 'radius', 'numCircles'];

function getFormData(element) {
  const formData = Object.fromEntries(new FormData(element));
  for (const name of ['useRandomColors', 'showLabels']) {
    formData[name] = formData[name] === 'on';
  }

  for (const name of NUMBER_FIELDS) {
    formData[name] = Number.parseFloat(formData[name]);
  }
  return formData;
}

function isFormDataValid(formData) {
  return (
    NUMBER_FIELDS.every(name => !Number.isNaN(formData[name])) &&
    formData.latitude >= -90 &&
    formData.latitude <= 90 &&
    formData.longitude >= -180 &&
    formData.longitude <= 180 &&
    formData.radius > 0
  );
}

function handleSubmit(e) {
  e.preventDefault();
  console.log(getFormData(e.target));
}

export { getFormData, isFormDataValid };
export default function gridForm(element) {
  $(element).on('submit', handleSubmit);
}
