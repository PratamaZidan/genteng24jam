import HomePresenter from "./home-presenter";
import Map from "../../utils/map";
import { saveStory, checkIfStorySaved } from "../../data/db";

export default class HomePage {
  #map = null;

  constructor() {
    this._map = null;
    this._markers = [];
    this.Map = null;
    this.storyMap = null;
    this.stories = [];
    this.saveButtons = [];
  }

  async render() {
    return `
      <div id='loading' class='loading' style='display:none;'>
        <div class='spinner'></div>
        <p>Memuat data...</p>
      </div>
      
      <section class='home'>
        <div id='map' style='height: 500px; margin-bottom: 50px;'></div>

        <h1 class="content-title">Daftar Berita</h1>
        <div id='story-list'></div>
        <p class="berita-cta">Ada info menarik? 
          <a href="#/add" class="link-berita">Tambahkan beritamu sekarang!</a>
        </p>
      </section>
    `;
  }

  async afterRender() {
    await this.initialMap();
    const presenter = new HomePresenter(this);
    await presenter.showStories();
    
  this.setupSaveButtons();
  await this.updateSavedStates();
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 10,
      locate: true,
    });

    this.Map = this.#map;
  }

  renderStories(stories) {
    this.stories = stories;
    const container = document.getElementById('story-list');

    container.innerHTML = stories.map((story, index) => {
      const formattedDate = this.formatDate(story.createdAt || story.createAt);

      if (this.#map && story.lat && story.lon) {
        const coordinate = [story.lat, story.lon];
        const markerOptions = { alt: story.name };
        const popupOptions = { content: `<b>${story.name}</b><br>${story.description}` };
        this.#map.addMarker(coordinate, markerOptions, popupOptions);
      }

      return `
        <div class='story' data-id='${story.id}' data-lat='${story.lat || ''}' data-lon='${story.lon || ''}'>
          <img src='${story.photoUrl}' alt='${story.description}' />
          <p>${story.name}</p>
          <p>${story.description}</p>
          ${story.lat && story.lon ? `
            <small class='location'>
              <i class='fas fa-map-marker-alt'></i> Lokasi:
              ${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}
            </small>` : ''
          }
          <small>Dibuat Pada: ${formattedDate}</small>
          <button class="save-btn" data-id="${story.id}">
            <i class="fas fa-bookmark"></i> Simpan Berita
          </button>
        </div>
      `;
    }).join('');

    this.addNewsMarkers(stories);
  }

  setupSaveButtons() {
    this.saveButtons.forEach(({ button, handler }) => {
      button.removeEventListener("click", handler);
    });
    this.saveButtons = [];

    const buttons = document.querySelectorAll(".save-btn");
    buttons.forEach((button) => {
      const handler = this.handleSaveClick.bind(this);
      button.addEventListener("click", handler);
      this.saveButtons.push({ button, handler });
    });
  }

  async handleSaveClick(e) {
    const button = e.currentTarget;
    button.disabled = true;

    try {
      const storyId = button.dataset.id;
      const story = this.stories.find((s) => s.id === storyId);

      if (!story) return;

      const isCurrentlySaved = await checkIfStorySaved(storyId);
      if (isCurrentlySaved) {
        alert("Berita ini sudah disimpan sebelumnya");
        return;
      }

      await saveStory(story);
      alert("Berita berhasil disimpan!");
    } catch (error) {
      console.error("Gagal menyimpan Berita:", error);
      alert("Gagal menyimpan Berita");
    } finally {
      button.disabled = false;
    }
  }

  async updateSavedStates() {
  const buttons = document.querySelectorAll(".save-btn");
  for (const button of buttons) {
    const id = button.dataset.id;
    if (await checkIfStorySaved(id)) {
      button.innerHTML = '<i class="fas fa-check"></i> Disimpan';
      button.disabled = true;
    }
  }
}

  addNewsMarkers(stories) {
    this.Map.addMarkers(stories);
    this._markers = this.Map.markers;
  }

  formatDate(dateValue) {
    try {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString('id-ID');
      }
    } catch (e) {
      console.warn("Format tanggal gagal:", dateValue);
    }
    return 'Tanggal tidak tersedia';
  }

  showLoading() {
    document.getElementById("loading").style.display = "flex";
  }

  hideLoading() {
    document.getElementById("loading").style.display = "none";
  }

  showError(message) {
  const container = document.getElementById('story-list');
  container.innerHTML = `<p class="error-message">${message}</p>`;
}
}
