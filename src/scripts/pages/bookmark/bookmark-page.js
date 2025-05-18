import { getSavedStories, deleteStory } from "../../data/db.js";

class BookmarkPage {
  async render() {
    return `
      <div id="loading" class="loading" style="display:none;">
        <div class="spinner"></div>
        <p>Memuat data...</p>
      </div>

      <h1>Daftar Berita Tersimpan</h1>
      <section class="home">
        <div id="saved-story-list"></div>
      </section>
    `;
  }

  async afterRender() {
    await this.showSavedStories();
  }

  async showSavedStories() {
    this.showLoading();
    try {
      const savedStories = await getSavedStories();
      this.renderSavedStories(savedStories);
    } catch (error) {
      console.error("Error loading saved news:", error);
      const container = document.getElementById("saved-story-list");
      if (container) {
        container.innerHTML = `
          <p class="error-message">Gagal memuat berita tersimpan</p>
        `;
      }
    } finally {
      this.hideLoading();
    }
  }

  renderSavedStories(stories) {
    const container = document.getElementById("saved-story-list");

    if (!container) {
      console.error("Container element not found");
      return;
    }

    if (stories.length === 0) {
      container.innerHTML =
        '<p style="text-align:center;">Belum ada berita yang disimpan.</p>';
      return;
    }

    container.innerHTML = stories
      .map(
        (story) => `
        <div class="story" data-id="${story.id}" data-lat="${
          story.lat || ""
        }" data-lon="${story.lon || ""}">
            <img src="${story.photoUrl}" alt="${story.description}">
            <p>${story.name}</p>
            <p>${story.description}</p>
            ${
              story.lat && story.lon
                ? `
            <small class="location">
                <i class="fas fa-map-marker-alt"></i> Lokasi
                ${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}
            </small>
            `
                : ""
            }
            <small>Dibuat Pada: ${new Date(story.createdAt).toLocaleString(
              "id-ID",
            )}</small>
          <button class="delete-btn" aria-label="Hapus Berita">
            <i class="material-icons">Hapus</i>
          </button>
        </div>
      `,
      )
      .join("");

    this.setupDeleteButtons();
  }

  setupDeleteButtons() {
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const storyElement = e.target.closest(".story");
        if (!storyElement) return;

        const storyId = storyElement.dataset.id;
        if (!storyId) return;

        if (confirm("Apakah Anda yakin ingin menghapus berita ini?")) {
          try {
            await deleteStory(storyId);
            storyElement.remove();

            const container = document.getElementById("saved-story-list");
            if (
              container &&
              container.querySelectorAll(".story").length === 0
            ) {
              container.innerHTML =
                '<p class="empty-message">Belum ada berita yang disimpan.</p>';
            }
          } catch (error) {
            console.error("Gagal menghapus berita:", error);
            alert("Gagal menghapus berita");
          }
        }
      });
    });
  }

  showLoading() {
    const loader = document.getElementById("loading");
    if (loader) loader.style.display = "flex";
  }

  hideLoading() {
    const loader = document.getElementById("loading");
    if (loader) loader.style.display = "none";
  }
}

export default BookmarkPage;
