const { merge } = require('webpack-merge');
const ExtensionReloader = require('webpack-ext-reloader');
const common = require('./webpack.config.dev.js');

module.exports = merge(common, {
  plugins: [
    new ExtensionReloader({
      port: 9090,
      reloadPage: true,
      //manifest: path.resolve(__dirname, "manifest.json"),
      entries: {
        contentScript: ['js/process_list.js', 'js/process_content.js'],
        service_worker: 'js/service_worker.js',
        extensionPage: ['html/options.js', 'html/options.html'],
      },
    }),
  ],
});
