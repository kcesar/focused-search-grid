import 'bootstrap';
import './style.scss';
import 'leaflet/dist/leaflet.css';
import gridForm from './grid-form';
import preview from './preview';
import registerServiceWorker from './register-service-worker';

const formElement = document.getElementById('grid-form');
const previewElement = document.getElementById('preview-map');

gridForm(formElement);
preview({ formElement, previewElement });
registerServiceWorker();
