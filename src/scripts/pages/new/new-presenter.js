export default class NewPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

   async postNewReport({ title, damageLevel, description, evidenceImages, latitude, longitude }) {
        this.#view.showSubmitLoadingButton();

        try {
            const response = await this.#model.storeNewReport({ title, damageLevel, description, evidenceImages, latitude, longitude });

            if (!response.ok) {
            this.#view.storeFailed(response.message);
            return;
            }

            this.#notifyToAllUser(response.data.id).then(result => {
            console.log('Notify all user result:', result);
            });

            this.#view.storeSuccessfully(response.message, response.data);
        } catch (error) {
            console.error('postNewReport: error:', error);
            this.#view.storeFailed(error.message);
        } finally {
            this.#view.hideSubmitLoadingButton();
        }
    }


    async #notifyToAllUser(reportId) {
        try {
            const response = await this.#model.sendReportToAllUserViaNotification(reportId);
            if (!response.ok) {
            console.error('#notifyToAllUser: response:', response);
            return false;
            }
            return true;
        } catch (error) {
            console.error('#notifyToAllUser: error:', error);
            return false;
        }
    }
}