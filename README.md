# SONG UNIVERSE

Pixel 9 Pro / 最新Chrome向けの、1画面・端末内生成音楽PWAです。曲は保存せず、現在曲と次の2曲だけをメモリに置きます。

## 起動と確認

```bash
npm ci
npm run dev
npm test
```

`npm test` は本番ビルド、生成規則、音域・重複・終止、SSRシェルを検証します。PWAのAudioContextは、画面の再生操作から開始します。

## 構成

- Sites/vinext + React + TypeScript、単一ルート、バックエンド・認証・永続化なし
- `chord_pitches_improv` と `drum_kit_rnn` をセルフホストし、TensorFlow.js WebGLで端末内推論
- MIDI互換の演奏イベントを生成し、SpessaSynthのAudioWorkletで合成
- GeneralUser GS 2.0.3を実証用に3つのSF3サブセットへ分割
- Cache Storage、Web App Manifest、Media Session、Canvasビジュアル／リアルタイム・ピアノロール

## 自動生成方針

- 曲→セクション→4小節フレーズの階層で、輪郭・リズム骨格・コード適合音を順に決める（[MusicVAE](https://arxiv.org/abs/1803.05428)、[Music Frameworks](https://archives.ismir.net/ismir2021/paper/000017.pdf)）。
- A/A′/応答/終止として小さな語彙を意図的に反復・変奏し、句末ほど予測可能にする（[Daiほか 2022](https://arxiv.org/abs/2209.00182)）。
- ジャズは拍位置・フレーズ・コードを同時に扱い、弱拍の外音だけを次の強拍で解決する（[Jazz Transformer](https://archives.ismir.net/ismir2020/paper/000339.pdf)、[Frielerほか 2022](https://transactions.ismir.net/articles/10.5334/tismir.87)）。
- 複数主旋律は独立生成せず、同一フレーズからコード構成音の3度・4度・5度・6度で派生する。

モデルは `public/models/`、音源は `public/soundfonts/`、ライセンス全文は `public/licenses/` にあります。音源パックを再生成する場合はGeneralUser GSのSF2を取得し、`npm run assets -- /path/to/GeneralUser-GS.sf2` を実行してください。

## 使用物とライセンス

- Magenta.js / TensorFlow.js: Apache-2.0
- SpessaSynth: Apache-2.0
- GeneralUser GS: 独自ライセンス v2.0（変更・再配布可。サンプル由来に関する注意書きを含む）
- wasm-media-encoders: MIT（SF3作成時のみ）

この実証版は商用公開の法務確認を行っていません。Magenta.jsの古い依存関係にはnpm auditの既知警告が残りますが、外部入力やアップロードは扱わず、同梱した固定チェックポイントだけを読みます。

## バックグラウンド制約

AudioWorkletとMedia Sessionにより画面オフ再生を可能な範囲で維持します。AndroidがChromeプロセスを停止した場合は復元せず、新しい曲から開始します。ネイティブアプリ相当の永続動作、完全オフライン初回起動、Pixel 9 Pro以外の互換性は保証しません。

実機では、PWAインストール、初回準備後3秒以内の発音、前景2時間、画面オフ30分、20回連続スキップ、イヤホン抜き差し、各ジャンル5曲の試聴を確認してください。
