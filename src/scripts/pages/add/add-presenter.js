// pages/add/add-presenter.js

import { addStory } from "../../data/genteng24jam-api";
import L from 'leaflet';
import Camera from '../../utils/camera';
import Map from "../../utils/map";

export default class AddPresenter {
  constructor(view) {
    this._view = view;
    this._video = null;
    this._canvas = null;
    this._photoResult = null;
    this._map = null;
    this._marker = null;
    this.lat = null;
    this.lon = null;
    this._stream = null;
    this.view = view;

    this.camera = null;
    this.photoBlob = null;
  }

  init() {
    const { video, canvas, photoResult } = this._view.getElements();
    this._video = video;
    this._canvas = canvas;
    this._photoResult = photoResult;
    this._initMap();
  }

  async openCamera() {
    this.photoBlob = null;
    document.getElementById('file-input').value = ''; 
    
    this.closeCamera();
    const elements = this._view.getElements();
    
    if (!this.camera) {
      this.camera = new Camera({
        video: elements.video,
        canvas: elements.canvas,
        cameraSelect: document.getElementById('camera-select')
      });
      
      this._view.toggleCamera(true);
      await this.camera.launch();
    } else {
      try {
        this._stream = await navigator.mediaDevices.getUserMedia({ video: true });
        this._video.srcObject = this._stream;
        this._view.toggleCamera(true);
      } catch (err) {
        alert('Gagal membuka kamera: ' + err.message);
      }
    }
  }

  closeCamera() {
    Camera.stopAllStreams();

    if (this.camera) {
      this.camera.stop();
      this.camera = null;
      this._view.toggleCamera(false);
      return;
    }

    if (this._stream) {
      this._stream.getTracks().forEach((track) => track.stop());
      this._stream = null;
    }

    const elements = this._view.getElements();
    if (elements.video) {
      elements.video.srcObject = null;
    }
    this._view.toggleCamera(false);
  }

  async takePhoto() {
    if (this.camera) {
      try {
        const imageBase64 = await this.camera.takePicture();
        this._view.showPhotoResult(imageBase64);

        this.photoBlob = await this.convertBase64ToBlob(imageBase64, 'image/png');
        return;
      } catch (error) {
        console.error('Error taking photo with Camera class:', error);
      }
    }

    const context = this._canvas.getContext('2d');
    this._canvas.width = this._video.videoWidth;
    this._canvas.height = this._video.videoHeight;
    context.drawImage(this._video, 0, 0, this._canvas.width, this._canvas.height);
    const imageData = this._canvas.toDataURL('image/jpeg');
    this._view.showPhotoResult(imageData);

    this.photoBlob = await this.convertBase64ToBlob(imageData, 'image/jpeg');
  }

  handleFileInput(event) {
    const file = event.target.files[0];
    if (file) {
      this.closeCamera();
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this._view.showPhotoResult(e.target.result);
        this.photoBlob = file;
      };
      reader.readAsDataURL(file);
    }
  }
  
  async convertBase64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
  }

  async _initMap() {
    this._map = await Map.build('#map', {
      zoom: 15,
      locate: true,
    });

    const centerCoordinate = this._map.getCenter();
    this._marker = this._map.addMarker(
      [centerCoordinate.latitude, centerCoordinate.longitude],
      { draggable: 'true' },
    );

    this._marker.addEventListener('move', (event) => {
      const coordinate = event.target.getLatLng();
      this._lat = coordinate.lat;
      this._lon = coordinate.lng;

      const { latInput, lonInput } = this._view.getElements();
      latInput.value = coordinate.lat;
      lonInput.value = coordinate.lng;

      if (this._view.updateCoordinates) {
        this._view.updateCoordinates(coordinate.lat, coordinate.lng);
      }
    });

    this._map.addMapEventListener('click', (e) => {
      const { lat, lng } = e.latlng;
      this._marker.setLatLng([lat, lng]);
      this._lat = lat;
      this._lon = lng;

      if (this._view.updateCoordinates) {
        this._view.updateCoordinates(lat, lng);
      }
    });
  }

  useMyLocation() {
    const { latInput, lonInput } = this._view.getElements();

    if (!navigator.geolocation) {
      alert('Geolocation tidak didukung browser ini.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this._lat = latitude;
        this._lon = longitude;
        latInput.value = latitude;
        lonInput.value = longitude;

        if (this._marker) {
          this._marker.setLatLng([latitude, longitude]);
        } else {
          this._marker = L.marker([latitude, longitude]).addTo(this._map.getMap());
        }

        this._map.getMap().setView([latitude, longitude], 15);

        if (this._view.updateCoordinates) {
          this._view.updateCoordinates(latitude, longitude);
        }
      },
      (error) => {
        alert('Gagal mendapatkan lokasi: ' + error.message);
      },
    );
  }

  async submitForm(e) {
    e.preventDefault();
    this._view?.showLoading();
  
    const description = document.getElementById('description').value;
    const lat = this._lat;
    const lon = this._lon;
  
    let photoToSubmit = null;
    
    const fileInput = document.getElementById('file-input');
    if (fileInput && fileInput.files && fileInput.files[0]) {
      photoToSubmit = fileInput.files[0];
    }
    else if (this.photoBlob) {
      photoToSubmit = this.photoBlob;
    }
    else {
      const imageDataUrl = document.getElementById('photo-result').src;
      if (imageDataUrl && imageDataUrl.startsWith('data:image')) {
        photoToSubmit = await (await fetch(imageDataUrl)).blob();
      }
    }
  
    if (!photoToSubmit) {
      alert('Pastikan sudah mengambil gambar.');
      this._view?.hideLoading();
      return;
    }
    
    if (lat == null || lon == null) {
      alert('Pastikan sudah menentukan lokasi.');
      this._view?.hideLoading();
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('photo', photoToSubmit, 'story.jpg');
      formData.append('lat', lat);
      formData.append('lon', lon);
  
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Token tidak ditemukan. Silakan login ulang.');
        return;
      }
  
      const result = await addStory(formData, token);
  
      alert(result.message);
      if (!result.error) {
        window.location.hash = '/';
        document.getElementById('add-story-form').reset();
        document.getElementById('photo-result').style.display = 'none';
      }
    } catch (err) {
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      this._view?.hideLoading();
    }
  }

  clearForm(e) {
    e.preventDefault();
    document.getElementById('add-story-form').reset();
  }

  cleanup() {
    this.closeCamera();
  }
  
}
