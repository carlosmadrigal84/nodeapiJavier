'use strict';

const i18n = require('./lib/i18nConfigure')();

const locale = process.env.LANG.split('.')[0].split('_')[0];
i18n.setLocale(locale);

console.log(i18n.__('Welcome to'));
