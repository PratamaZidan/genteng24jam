import { getStories } from "../../data/genteng24jam-api";

export default class HomePresenter {
  constructor(view) {
    this._view = view;
  }

  async showStories() {
    try {
      this._view.showLoading();

      const token = localStorage.getItem("token");
      if (!token) {
        window.location.hash = "#/login";
        return;
      }

      const { listStory, error } = await getStories(token, true);

      if (error) throw new Error(error.message || "Gagal memuat cerita");

      this._view.renderStories(listStory);
    } catch (error) {
      this._view.showError(error.message);
    } finally {
      this._view.hideLoading();
    }
  }
}
