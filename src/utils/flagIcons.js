export const flagIcon = (locale) => {
  switch (locale) {
    case 'zh':
      return require('../assets/flags/cn.svg');
    case 'zh-Hant':
      return require('../assets/flags/cn.svg');
    default:
      return require('../assets/flags/gb.svg');
  }
};
