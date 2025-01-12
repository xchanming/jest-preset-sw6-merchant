const { join, resolve } = require('path');

const srcPath = global.adminPath;
if (!srcPath) {
    throw new Error('"globals.adminPath" is not defined. A file path to a Cicada 6 merchant administration is required');
}

const disableJestCompatMode = process.env.DISABLE_JEST_COMPAT_MODE === 'true' ?? false;

global.window._features_ = {};

if (!disableJestCompatMode) {
    global.console.warn = () => {};
}

if (disableJestCompatMode) {
    window._features_.DISABLE_VUE_COMPAT = true;
}

const Merchant = require(resolve(join(srcPath, `src/core/merchant.ts`))).MerchantInstance;

// Take all keys out of Merchant.compatConfig but set them to true
const compatConfig = Object.fromEntries(Object.keys(Merchant.compatConfig).map(key => [key, !disableJestCompatMode]));
const envBefore = process.env.NODE_ENV;

// src/Administration/Resources/app/administration/node_modules/@vue/compat/index.js loads different files based on NODE_ENV
process.env.NODE_ENV = 'production';
const configureCompat = require(resolve(join(srcPath, 'node_modules/@vue/compat/dist/vue.cjs.js'))).configureCompat;

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
configureCompat(compatConfig);

// Enable Pinia Support
const { createApp } = require(resolve(join(srcPath, 'node_modules/@vue/compat/dist/vue.cjs.js')));
const app = createApp();
app.use(Merchant.Store._rootState)

process.env.NODE_ENV = envBefore;

module.exports = (() => {
    global.Merchant = Merchant;
    require(resolve(join(srcPath, 'src/app/mixin/index'))).default(); // eslint-disable-line
    require(resolve(join(srcPath, 'src/app/directive/index'))).default(); // eslint-disable-line
    require(resolve(join(srcPath, 'src/app/filter/index'))).default(); // eslint-disable-line
    require(resolve(join(srcPath, 'src/app/init-pre/state.init'))).default(); // eslint-disable-line
    require(resolve(join(srcPath, 'src/app/init/component-helper.init'))).default(); // eslint-disable-line
})();
