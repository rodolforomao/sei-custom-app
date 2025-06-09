module.exports = {
  launch: {
    dumpio: true,
    headless: process.env.HEADLESS !== 'false',
    args: ['--disable-web-security'],
  },
  launch: {
    product: 'chrome'
  },
  browserContext: 'default',
};
