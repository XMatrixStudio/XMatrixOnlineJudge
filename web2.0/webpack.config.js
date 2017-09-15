let path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

function resolve(dir) {
  return path.join(__dirname, '/', dir);
}

module.exports = {
  devtool: 'eval-source-map', //source-map cheap-module-source-map eval-source-map cheap-module-eval-source-map
  entry: './src/main.js',
  output: {
    /* 输出目录，没有则新建 */
    path: path.resolve(__dirname, './dist'),
    /* 静态目录，可以直接从这里取文件 */
    publicPath: '',
    /* 文件名 */
    filename: '[name].js',
  },
  devServer: {
    contentBase: "./public", //本地服务器所加载的页面所在的目录
    historyApiFallback: true, //不跳转
    inline: true, //实时刷新
    port: 8080
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue': 'vue/dist/vue.js',
      '@': resolve('src')
    }
  },
  module: {
    rules: [{
      test: /(\.jsx|\.js)$/,
      loader: "babel-loader",
      exclude: /node_modules/
    }, {
      test: /\.vue$/,
      loader: 'vue-loader'
    }, {
      test: /\.scss$/,
      loaders: ["style", "css", "sass"]
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, './index.html'),
      title: 'XMatrix Online Judge',
      inject: true
    })
  ]
}