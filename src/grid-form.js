import $ from 'jquery';
import randomcolor from 'randomcolor';
import { bullseye } from 'going-in-circles';
import { DEFAULT_COLOR } from './constants';

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

function getSegmentTitle({ circleIndex, segmentIndex }) {
  if (circleIndex === 0) {
    return 100;
  }

  const numSegmentsInPreviousCircle = 2 ** (circleIndex + 1);
  const lastSegmentTitle = getSegmentTitle({
    circleIndex: circleIndex - 1,
    segmentIndex: numSegmentsInPreviousCircle - 1,
  });

  const base = lastSegmentTitle + (10 - (lastSegmentTitle % 10));
  return base + segmentIndex;
}

function getGeoJSON({ circles, formData }) {
  const { latitude, longitude, useRandomColors } = formData;
  const point = {
    type: 'Feature',
    geometry: {
      coordinates: [longitude, latitude],
      type: 'Point',
    },
    properties: {
      'marker-symbol': 'c:target1',
      'marker-color': DEFAULT_COLOR,
      title: 'center',
      class: 'Marker',
    },
  };

  const circleFeatures = circles
    .map((circle, circleIndex) =>
      circle.segments.map((segment, segmentIndex) => {
        const color = useRandomColors ? randomcolor() : DEFAULT_COLOR;
        return {
          type: 'Feature',
          properties: {
            stroke: color,
            'stroke-opacity': 1,
            'stroke-width': 2,
            fill: color,
            'fill-opacity': 0.1,
            description: '',
            title: getSegmentTitle({ circleIndex, segmentIndex }).toString(),
            class: 'Shape',
            gpstype: 'TRACK',
          },
          geometry: {
            type: 'Polygon',
            coordinates: [segment],
          },
        };
      })
    )
    .flat();

  const geoJSON = {
    type: 'FeatureCollection',
    features: [point, ...circleFeatures],
  };
  return JSON.stringify(geoJSON, null, 2);
}

function handleSubmit(e) {
  e.preventDefault();
  const formData = getFormData(e.target);
  const { latitude, longitude, numCircles, radius } = formData;
  const circles = bullseye({
    center: { lat: latitude, long: longitude },
    radius,
    numCircles,
  });
  const geoJSON = getGeoJSON({ circles, formData });
  const blob = new Blob([geoJSON], { type: 'text/plain' });
  const newEvent = document.createEvent('MouseEvents');
  const a = document.createElement('a');
  a.download = formData.filename || 'focus_search_grid.json';
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
  newEvent.initEvent(
    'click',
    true,
    false,
    window,
    0,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null
  );
  a.dispatchEvent(newEvent);
}

export { getFormData, isFormDataValid };
export default function gridForm(element) {
  $(element).on('submit', handleSubmit);
}
