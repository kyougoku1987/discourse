import debounce from 'discourse/lib/debounce';
import { renderSpinner } from 'discourse/helpers/loading-spinner';
import { escapeExpression } from 'discourse/lib/utilities';

export default Ember.Component.extend({
  classNames: ["admin-backups-logs"],

  init() {
    this._super();
    this._reset();
  },

  _reset() {
    this.setProperties({ formattedLogs: "", index: 0 });
  },

  _updateFormattedLogs: debounce(function() {
    const logs = this.get("logs");
    if (logs.length === 0) {
      this._reset(); // reset the cached logs whenever the model is reset
    } else {
      // do the log formatting only once for HELLish performance
      let formattedLogs = this.get("formattedLogs");
      for (let i = this.get("index"), length = logs.length; i < length; i++) {
        const date = logs[i].get("timestamp"),
              message = escapeExpression(logs[i].get("message"));
        formattedLogs += "[" + date + "] " + message + "\n";
      }
      // update the formatted logs & cache index
      this.setProperties({ formattedLogs: formattedLogs, index: logs.length });
      // force rerender
      this.rerender();
    }
  }, 150).observes("logs.[]").on('init'),

  render(buffer) {
    const formattedLogs = this.get("formattedLogs");
    if (formattedLogs && formattedLogs.length > 0) {
      buffer.push("<pre>");
      buffer.push(formattedLogs);
      buffer.push("</pre>");
    } else {
      buffer.push("<p>" + I18n.t("admin.backups.logs.none") + "</p>");
    }
    // add a loading indicator
    if (this.get("status.isOperationRunning")) {
      buffer.push(renderSpinner('small'));
    }
  },

  didInsertElement() {
    this._super();
    const $div = this.$()[0];
    $div.scrollTop = $div.scrollHeight;
  },
});
