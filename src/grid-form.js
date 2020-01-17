import $ from 'jquery';
import randomcolor from 'randomcolor';
import FileSaver from 'file-saver';
import { equalAreaBullseye, bullseye } from 'going-in-circles';
import { DEFAULT_COLOR } from './constants';

const NUMBER_FIELDS = [
  'latitude',
  'longitude',
  'numCircles',
  'segmentArea',
  'radius',
];

const handleSegmentsChange = e => {
  const radius = $('#radius');
  const segmentArea = $('#segmentArea');
  if (e.target.checked) {
    radius
      .prop('disabled', true)
      .data('last-value', radius.val())
      .val('nope');
    segmentArea.prop('disabled', false).val(segmentArea.data('last-value'));
  } else {
    radius.prop('disabled', false).val(radius.data('last-value'));
    segmentArea
      .prop('disabled', true)
      .data('last-value', segmentArea.val())
      .val('nope');
  }
};

function getFormData(element) {
  const formData = Object.fromEntries(new FormData(element));
  for (const name of [
    'useRandomColors',
    'showLabels',
    'segmentsHaveSameArea',
  ]) {
    formData[name] = formData[name] === 'on';
  }

  for (const name of NUMBER_FIELDS) {
    formData[name] = Number.parseFloat(formData[name]) || 0;
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
    ((formData.segmentsHaveSameArea && formData.segmentArea > 0) ||
      (!formData.segmentsHaveSameArea && formData.radius > 0))
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
  const { latitude, longitude, useRandomColors, showLabels } = formData;
  const point = {
    type: 'Feature',
    geometry: {
      coordinates: [longitude, latitude],
      type: 'Point',
    },
    properties: {
      'marker-symbol': 'c:target1',
      'marker-color': DEFAULT_COLOR,
      title: showLabels ? 'center' : '',
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
            title: showLabels
              ? getSegmentTitle({ circleIndex, segmentIndex }).toString()
              : '',
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
  return JSON.stringify(geoJSON);
}

function handleSubmit(e) {
  e.preventDefault();
  const formData = getFormData(e.target);
  const { latitude, longitude, numCircles, radius } = formData;
  const center = { lat: latitude, long: longitude };
  const circles = formData.segmentsHaveSameArea
    ? equalAreaBullseye({
        center,
        area: formData.segmentArea,
        numCircles,
      })
    : bullseye({
        center,
        radius,
        numCircles,
      });
  const geoJSON = getGeoJSON({ circles, formData });
  const filename = formData.filename || 'focus_search_grid.json';
  const geoBlob = new Blob([geoJSON], {
    type: 'application/json',
    name: filename,
  });
  FileSaver.saveAs(geoBlob, filename);
}

export { getFormData, isFormDataValid };
export default function gridForm(element) {
  $(element).on('submit', handleSubmit);
  const sameAreaCheckbox = $(element).find('#segments-have-same-area');
  sameAreaCheckbox.on('change', handleSegmentsChange);
  handleSegmentsChange({
    target: { checked: sameAreaCheckbox.is(':checked') },
  });
}
