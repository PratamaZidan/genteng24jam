import { reportMapper } from '../../data/api-mapper';

export default class ReportDetailPresenter {
  #reportId;
  #view;
  #apiModel;
  #dbModel;

  constructor(reportId, { view, apiModel, dbModel }) {
    this.#reportId = reportId;
    this.#view = view;
    this.#apiModel = apiModel;
    this.#dbModel = dbModel;
  }

  async postNewComment({ body }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#apiModel.storeNewCommentByReportId(this.#reportId, { body });

      if (!response.ok) {
        console.error('postNewComment: response:', response);
        this.#view.postNewCommentFailed(response.message);
        return;
      }

      this.notifyReportOwner(response.data.id);

      this.#view.postNewCommentSuccessfully(response.message, response.data);
    } catch (error) {
      console.error('postNewComment: error:', error);
      this.#view.postNewCommentFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }

  async notifyReportOwner(commentId) {
    try {
      const response = await this.#apiModel.sendCommentToReportOwnerViaNotification(
        this.#reportId,
        commentId,
      );
      if (!response.ok) {
        console.error('notifyReportOwner: response:', response);
        return;
      }
      console.log('notifyReportOwner:', response.message);
    } catch (error) {
      console.error('notifyReportOwner: error:', error);
    }
  }

  async notifyMe() {
    try {
      const response = await this.#apiModel.sendReportToMeViaNotification(this.#reportId);
      if (!response.ok) {
        console.error('notifyMe: response:', response);
        return;
      }
      console.log('notifyMe:', response.message);
    } catch (error) {
      console.error('notifyMe: error:', error);
    }
  }

  async saveReport() {
    try {
      const report = await this.#apiModel.getReportById(this.#reportId);
      await this.#dbModel.putReport(report.data);
      this.#view.saveToBookmarkSuccessfully('Success to save to bookmark');
    } catch (error) {
      console.error('saveReport: error:', error);
      this.#view.saveToBookmarkFailed(error.message);
    }
  }

  async removeReport() {
    try {
      await this.#dbModel.removeReport(this.#reportId);

      this.#view.removeFromBookmarkSuccessfully('Success to remove from bookmark');
    } catch (error) {
      console.error('removeReport: error:', error);
      this.#view.removeFromBookmarkFailed(error.message);
    }
  }

  async showSaveButton() {
    if (await this.#isReportSaved()) {
      this.#view.renderRemoveButton();
      return;
    }

    this.#view.renderSaveButton();
  }

  async #isReportSaved() {
    return !!(await this.#dbModel.getReportById(this.#reportId));
  }
}