import i18n from 'i18next';
import en from '@next-book/interface/src/js/translation/en.json';
import cs from '@next-book/interface/src/js/translation/cs.json';

i18n.init({
  fallbackLng: 'en',
  resources: { cs, en },
});

export default i18n;
