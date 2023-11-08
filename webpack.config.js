const path = require('path');

module.exports = {
  mode: "development",

  entry: {
    bundle: './src/assets/javascripts/main.ts'
  },
  output: {
    path: path.join(__dirname,'dist'),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test:/\.ts$/,use:'ts-loader'
      }
    ],
  },
  resolve: {
    extensions:['.ts','.js']
  },

  optimization:{
    splitChunks:{
      name:'vendor',
      chunks:'initial',
    }
  },

  performance:{hints:false}
};
