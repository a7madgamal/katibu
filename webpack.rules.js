module.exports = [
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|.webpack)/,
    loaders: [
      {
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
    ],
  },

  {
    test: /\.css$/,
    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
  },
  {
    test: /\.(png|jpe?g|gif)$/,
    use: [
      {
        loader: 'file-loader',
        options: {
          outputPath: 'assets',
        },
      },
    ],
  },
]
