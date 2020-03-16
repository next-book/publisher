const i18n = require('i18next');

const en = require('nb-base/src/js/translation/en.json');
const cs = require('nb-base/src/js/translation/cs.json');

i18n.init({
  fallbackLng: 'en',
  resources: { cs, en },
});

module.exports = i18n;
