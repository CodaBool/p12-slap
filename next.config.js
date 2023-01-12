const withTM = require('next-transpile-modules')(['three'])
module.exports = withTM({
  reactStrictMode: false, // stricter checks, https://reactjs.org/docs/strict-mode.html
})