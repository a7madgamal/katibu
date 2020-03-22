const rules = require('./webpack.rules')

module.exports = {
  entry: './src/main/index.ts',
  module: {
    rules,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
}
