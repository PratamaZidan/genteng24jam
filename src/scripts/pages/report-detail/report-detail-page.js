import ReportDetailPresenter from './report-detail-presenter';
import { parseActivePathname } from '../routes/url-parser'; 
import apiModel from '../data/genteng24jam'; 
import * as Database from '../../data/db';

export default class ReportDetailPage {
  #presenter = null;

  async render() {
    return `
      <button id="report-detail-notify-me">Notify Me</button>
      <!-- konten lainnya -->
    `;
  }

  async afterRender() {
    const reportId = parseActivePathname().id;

    this.#presenter = new ReportDetailPresenter(reportId, {
      view: this,
      apiModel,  
      dbModel: Database,
    });

    this.addNotifyMeEventListener();
    await this.#presenter.showSaveButton();
  }

  addNotifyMeEventListener() {
    const notifyBtn = document.getElementById('report-detail-notify-me');
    if (notifyBtn) {
      notifyBtn.addEventListener('click', () => {
        this.#presenter.notifyMe();
      });
    } else {
      console.warn('Tombol notify me tidak ditemukan di DOM');
    }
  }

  showNotificationMessage(message) {
    alert(message);
  }

  renderSaveButton() {
    document.getElementById('save-actions-container').innerHTML =
      generateSaveReportButtonTemplate()
  
    document.getElementById('report-detail-save').addEventListener('click', async () => {
      await this.#presenter.saveReport();
    });
  }

  saveToBookmarkSuccessfully(message) {
    console.log(message);
  }

  saveToBookmarkFailed(message) {
    alert(message);
  }

  renderRemoveButton() {
    document.getElementById('save-actions-container').innerHTML =
      generateRemoveReportButtonTemplate();

    document.getElementById('report-detail-remove').addEventListener('click', async () => {
      await this.#presenter.removeReport();
      await this.#presenter.showSaveButton();
    });
  }
}
