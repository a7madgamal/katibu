const rules = require('./webpack.rules')

module.exports = {
  module: {
    rules,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
}
