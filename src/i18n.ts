import i18n, { TOptions } from 'i18next';
import en from '@next-book/interface/src/js/translation/en.json';
import cs from '@next-book/interface/src/js/translation/cs.json';

export const resources = { cs, en };

/**
 * Fully type safe solution is still in progress, see https://github.com/i18next/i18next/issues/1504
 * Currently, the only i18next interface leaved for user augmentation is PluginOptions, which is not sufficient.
 * This solution uses key lookup according to https://stackoverflow.com/questions/58277973/how-to-type-check-i18n-dictionaries-with-typescript
 * It could be used in interface, but with react-i18next, typing may be simpler, see https://react.i18next.com/latest/typescript
 */

i18n.init({
  fallbackLng: 'en',
  resources,
});

type Concat<K extends string, P extends string> = `${K}${'' extends P ? '' : ':'}${P}`;

/**
 * Gets keys like "footer" | "header" | "footer.copyright"
 */
type DeepKeys<T> = T extends object
  ? {
      [K in keyof T]-?: `${K & string}` | Concat<K & string, DeepKeys<T[K]>>;
    }[keyof T]
  : '';

/**
 * Gets only keys like "footer.copyright" | "header.logo" | "header.link"
 */
type DeepLeafKeys<T> = T extends object
  ? { [K in keyof T]-?: Concat<K & string, DeepKeys<T[K]>> }[keyof T]
  : '';

type GetDictValue<T extends string, O> = T extends `${infer A}:${infer B}`
  ? A extends keyof O
    ? GetDictValue<B, O[A]>
    : never
  : T extends keyof O
  ? O[T]
  : never;

/**
 * Type safe translation function
 *
 * @remarks Check only the keys of fallback language. Type checking may be slow given huge number
 * of translation strings in configs.
 *
 * @param key Key of the translation from the fallback language dictionary.
 * @returns Corresponding translation for the key.
 */
const t = <TKeys extends string>(
  key: DeepLeafKeys<typeof en>,
  options: TOptions | string
): GetDictValue<TKeys, typeof en> => i18n.t(key, options) as GetDictValue<TKeys, typeof en>;

export default t;
