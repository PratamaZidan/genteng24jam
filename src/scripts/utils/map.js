import { map, tileLayer, Icon, icon, marker, popup, latLng } from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MAP_SERVICE_API_KEY } from '../config';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default class Map {
  #zoom = 5;
  #map = null;

  constructor(selector, options = {}) {
    this.#zoom = options.zoom ?? this.#zoom;

    const tileOsm = tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    });

    this.#map = map(document.querySelector(selector), {
      zoom: this.#zoom,
      scrollWheelZoom: false,
      layers: [tileOsm],
      ...options,
    });

    this._markers = [];
  }

  static async getPlaceNameByCoordinate(latitude, longitude) {
    try {
      const url = new URL(`https://api.maptiler.com/geocoding/${longitude},${latitude}.json`);
      url.searchParams.set('key', MAP_SERVICE_API_KEY);
      url.searchParams.set('language', 'id');
      url.searchParams.set('limit', '1');
      const response = await fetch(url);
      const json = await response.json();
      const place = json.features[0].place_name.split(', ');
      return [place.at(-2), place.at(-1)].join(', ');
    } catch (error) {
      console.error('getPlaceNameByCoordinate: error:', error);
      return `${latitude}, ${longitude}`;
    }
  }

  static isGeolocationAvailable() {
    return 'geolocation' in navigator;
  }

  static getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!Map.isGeolocationAvailable()) {
        reject('Geolocation API unsupported');
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  static async build(selector, options = {}) {
    const jakartaCoordinate = [-6.2, 106.816666];

    if ('locate' in options && options.locate) {
      try {
        const position = await Map.getCurrentPosition();
        const coordinate = [position.coords.latitude, position.coords.longitude];
        return new Map(selector, { ...options, center: coordinate });
      } catch (error) {
        console.error('build: error:', error);
        return new Map(selector, { ...options, center: jakartaCoordinate });
      }
    }

    return new Map(selector, { ...options, center: jakartaCoordinate });
  }

  get leafletInstance() {
    return this.#map;
  }

  getMap() {
    return this.#map;
  }

  changeCamera(coordinate, zoomLevel = null) {
    if (!zoomLevel) {
      this.#map.setView(latLng(coordinate), this.#zoom);
    } else {
      this.#map.setView(latLng(coordinate), zoomLevel);
    }
  }

  getCenter() {
    const { lat, lng } = this.#map.getCenter();
    return {
      latitude: lat,
      longitude: lng,
    };
  }

  createIcon(options = {}) {
    return icon({
      ...Icon.Default.prototype.options,
      iconRetinaUrl: markerIcon2x,
      shadowUrl: markerShadow,
      ...options,
    });
  }

  addMapEventListener(eventName, callback) {
    this.#map.addEventListener(eventName, callback);
  }

  addMarker(coordinates, markerOptions = {}, popupOptions = null) {
    if (typeof markerOptions !== 'object') {
      throw new Error("markerOptions must be an object");
    }

    const newMarker = marker(coordinates, {
      icon: this.createIcon(),
      ...markerOptions,
    });

    if (popupOptions) {
      if (typeof popupOptions !== 'object') {
        throw new Error("popupOptions must be an object");
      }
      if (!('content' in popupOptions)) {
        throw new Error("popupOptions must include `content` property.");
      }

      const newPopup = popup(coordinates, popupOptions);
      newMarker.bindPopup(newPopup);
    }

    newMarker.addTo(this.#map);
    return newMarker;
  }

  addMarkers(stories = []) {
    if (!Array.isArray(stories)) {
      throw new Error("Parameter stories harus berupa array");
    }

    this._markers = [];

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const coordinates = [story.lat, story.lon];
        const markerOptions = { alt: story.name };
        const popupOptions = {
          content: `<b>${story.name}</b><br>${story.description}`,
        };

        const newMarker = this.addMarker(coordinates, markerOptions, popupOptions);
        this._markers.push(newMarker);
      }
    });
  }

  get markers() {
    return this._markers || [];
  }

  set markers(val) {
    this._markers = val;
  }
}
