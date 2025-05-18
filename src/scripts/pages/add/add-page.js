import AddPresenter from './add-presenter';

export default class AddPage {
  constructor() {
    this._presenter = null;
  }

  async render() {
    return `
      <h1 class="content-title">Tambah Berita</h1>
      <section class='add-story'>
        <form id='add-story-form'>
          <label for='description'>Deskripsi</label>
          <textarea id='description' required></textarea>

          <label for='documentations-input'>Gambar</label>
          <div class='camera-buttons'>
            <button type='button' id='open-camera'>Buka Kamera</button>
            <button type='button' id='close-camera' style='display:none;'>Tutup Kamera</button>
            <input type='file' id='file-input' class='input-image' accept='image/*' style='display:none;'>
            <button type='button' id='file-input-button'>Pilih Gambar</button>
          </div>
          
          <div id='camera-container' class='camera-container'>
            <video id='camera-preview'  autoplay playsinline style='display:none; width:100%; max-width:400px;'></video>
            <canvas id='photo-canvas' style='display:none;'></canvas>
            <div class='camera-tools'  style='display:none;!important display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin-top: 30px;'>
              <select id='camera-select'></select>
              <button type='button' id='take-photo'>Ambil Gambar</button>
            </div>
          </div>
          
          <div class='image-preview'>
            <img id='photo-result' src='' alt='Hasil Foto' style='display:none; width:100%; max-width:400px;' />
          </div>

          <label>Lokasi</label>
          <div id='map' style='height: 300px;'></div>
          <input type='hidden' id='lat'>
          <input type='hidden' id='lon'>
          <div class='location-coordinates'>
            <span>Latitude: <span id='lat-display'>-</span></span>
            <span>Longitude: <span id='lon-display'>-</span></span>
          </div>

          <button type='button' id='use-my-location'>Gunakan Lokasi Saya</button>
          <button type='submit' id='submit-btn'>Kirim</button>
        </form>

        <p class='berita-cta'>Mantap! Sekarang kamu bisa cek <a href='#/' class='link-berita'>Daftar Berita</a></p>
      </section>
    `;
  }

  async afterRender() {
    this._presenter = new AddPresenter(this);
    this._presenter.init();

    document.getElementById('file-input-button')
      .addEventListener('click', () => {
        document.getElementById('file-input').click();
      });
      
    document.getElementById('file-input')
      .addEventListener('change', (e) => this._presenter.handleFileInput(e));
      
    document.getElementById('open-camera')
      .addEventListener('click', () => this._presenter.openCamera());
      
    document.getElementById('close-camera')
      .addEventListener('click', () => this._presenter.closeCamera());
      
    document.getElementById('take-photo')
      .addEventListener('click', () => this._presenter.takePhoto());
      
    document.getElementById('use-my-location')
      .addEventListener('click', () => this._presenter.useMyLocation());
      
    document.getElementById('add-story-form')
      .addEventListener('submit', (e) => this._presenter.submitForm(e));

    window.addEventListener('hashchange', () => {
      if (this._presenter) {
        this._presenter.cleanup();
      }
    });
  }

  getElements() {
    return {
      video: document.getElementById('camera-preview'),
      canvas: document.getElementById('photo-canvas'),
      photoResult: document.getElementById('photo-result'),
      description: document.getElementById('description'),
      latInput: document.getElementById('lat'),
      lonInput: document.getElementById('lon'),
      latDisplay: document.getElementById('lat-display'),
      lonDisplay: document.getElementById('lon-display'),
      cameraContainer: document.getElementById('camera-container'),
      cameraTools: document.querySelector('.camera-tools')
    };
  }

  showPhotoResult(src) {
    const img = document.getElementById('photo-result');
    img.src = src;
    img.style.display = 'block';
  }

  toggleCamera(show) {
  const cameraTools = document.querySelector('.camera-tools');
  const { video } = this.getElements?.() || {};

  const closeCameraBtn = document.getElementById('close-camera');
  const openCameraBtn = document.getElementById('open-camera');

  if (video && video.style) video.style.display = show ? 'block' : 'none';
  if (cameraTools && cameraTools.style) cameraTools.style.display = show ? 'flex' : 'none';

  if (closeCameraBtn) closeCameraBtn.style.display = show ? 'inline-block' : 'none';
  if (openCameraBtn) openCameraBtn.style.display = show ? 'none' : 'inline-block';
  } 

  updateCoordinates(lat, lng) {
    const elements = this.getElements();
    elements.latInput.value = lat;
    elements.lonInput.value = lng;
    elements.latDisplay.textContent = lat.toFixed(6);
    elements.lonDisplay.textContent = lng.toFixed(6);
  }

  showLoading() {
    document.getElementById('submit-btn').innerHTML = '<i class="fas fa-spinner loader-button"></i> Mengirim...';
    document.getElementById('submit-btn').disabled = true;
  }

  hideLoading() {
    document.getElementById('submit-btn').innerText = 'Kirim';
    document.getElementById('submit-btn').disabled = false;
  }
}