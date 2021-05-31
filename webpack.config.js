const webpack = require('webpack')
const path = require('path')

module.exports = {
  target: 'web',
  entry: './build/code.js',
  mode: 'development',
  devtool: false,
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js'
  },
  resolve: {
    fallback: {
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/')
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    })
  ]
}
