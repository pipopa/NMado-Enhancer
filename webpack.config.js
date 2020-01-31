const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

// output.pathに絶対パスを指定する必要があるため、pathモジュールを読み込んでおく
const path = require("path");

module.exports = {
  // モードの設定、v4系以降はmodeを指定しないと、webpack実行時に警告が出る
  mode: "development",
  // エントリーポイントの設定
  entry: {
    chat: path.join(__dirname, "src", "chat_entry.js"),
    player: path.join(__dirname, "src", "player_entry.js"),
    nmado: path.join(__dirname, "src", "nmado_entry.js")
  },
  // 出力の設定
  output: {
    // 出力するファイル名
    filename: "[name]_content_script.js",
    // 出力先のパス（絶対パスを指定する必要がある）
    path: path.join(__dirname, "build")
  },
  plugins: [
    new CopyPlugin([
      { from: path.join(__dirname, "src", "manifest.json"), to: "." },
      { from: path.join(__dirname, "src", "background.js"), to: "." },
      { from: path.join(__dirname, "src", "images", "icon128.png"), to: "." },
      { from: path.join(__dirname, "src", "images", "icon48.png"), to: "." },
      { from: path.join(__dirname, "src", "images", "icon16.png"), to: "." },
      { from: path.join(__dirname, "src", "style"), to: "style" },
      { from: path.join(__dirname, "src", "options"), to: "options/" },
    ]),
    new CleanWebpackPlugin(),
  ]
};
