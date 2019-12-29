import $ from 'jquery';
import leaflet from 'leaflet';
import randomcolor from 'randomcolor';
import { bullseye } from 'going-in-circles';
import { isFormDataValid, getFormData } from './grid-form';
import { DEFAULT_COLOR } from './constants';

function addOverlay({ formData, map }) {
  const { latitude, longitude, numCircles, radius } = formData;
  const circles = bullseye({
    center: { lat: latitude, long: longitude },
    radius,
    numCircles,
  });
  for (const circle of circles) {
    const color = formData.useRandomColors ? randomcolor() : DEFAULT_COLOR;
    for (const segment of circle.segments) {
      leaflet
        .geoJSON(
          {
            type: 'Polygon',
            coordinates: [segment],
          },
          {
            style: {
              color,
              weight: 5,
              opacity: 0.65,
            },
          }
        )
        .addTo(map);
    }
  }
}

function createTileLayer() {
  return leaflet.tileLayer(
    'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      accessToken:
        'pk.eyJ1IjoiYW5pbHJlZHNoaWZ0IiwiYSI6ImNrNG9sZTBjcDAzejMzamwxejk2cXozaG0ifQ.9vMIi2-zygupw9nfThJ0MA',
    }
  );
}

export default function preview({ previewElement, formElement }) {
  const map = leaflet.map(previewElement);
  const tileLayer = createTileLayer();
  tileLayer.addTo(map);

  $(formElement)
    .find(':input')
    .on('change', () => {
      const formData = getFormData(formElement);
      if (isFormDataValid(formData)) {
        map.eachLayer(layer =>
          layer === tileLayer ? null : map.removeLayer(layer)
        );
        addOverlay({ formData, map });
        map.setView([formData.latitude, formData.longitude], 13);
        $(previewElement).removeClass('invisible');
      } else {
        $(previewElement).addClass('invisible');
      }
    });
}
