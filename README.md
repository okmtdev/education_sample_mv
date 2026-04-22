# ミネルバ こども クイズ (小学受験対策ゲーム)

ミネルバ発問集（知研）で扱われる典型的な出題分野を参考にした、
幼児〜未就学児向けのブラウザ学習ゲームです。
**タブレットやパソコンのブラウザ**で、子どもが親子といっしょに遊ぶことを想定しています。

> 本リポジトリは学習目的の自作サンプルで、ミネルバ発問集そのものを収録しているわけではありません。
> 出題分野・設問形式を参考にした類似ゲームを独自実装したものです。

---

## 収録している問題 (10ジャンル)

| 絵文字 | ジャンル | 鍛える力 | 参考にしたミネルバ発問集の項目 |
| --- | --- | --- | --- |
| 🌸 | 季節 | 常識・季節感 | 10. 季節 |
| 📖 | 話の記憶 | 記憶力・集中力 | 11. 話の記憶 / 16. 話の記憶 |
| 👈 | 左右 | 位置関係・対称把握 | 12. 左右 |
| 🎲 | 系列 | 規則性の発見・推論 | 13. 系列 |
| 🔄 | 同図形発見 | 空間認識・回転把握 | 14. 同図形発見 |
| 📜 | 常識（昔話） | 常識・物語知識 | 15. 常識 |
| 🔗 | しりとり | 語彙・音韻操作 | 17. しりとり |
| 🧩 | 欠所補充 | 観察力・比較 | 18. 欠所補充 |
| 🧱 | 積木 | 空間把握・数量 | 19. 積木 |
| 📏 | 順番 | 大小比較・順序数 | 20. 順番 |

## 遊び方

ホーム画面で **3つのモード** から選びます。

- ⭐ **おすすめ**： 全ジャンルをバランスよく 1問ずつ、計 10問。
- 🎲 **ランダム**： 毎回ランダムにジャンルを選んで 10問。
- 🧩 **じぶんで えらぶ**： ジャンルごとに問題数を指定してカスタム問題集を作成。

### 記録 (きろく)

- 各セッションの **日時 / モード / ジャンル内訳 / 正答数・正答率** を `localStorage` に保存します (最新100件)。
- 画面上部の「きろく」タブから以下を確認できます。
  - **正解率の軌跡** (直近 30セッションの折れ線)
  - **ジャンル別の通算 正答率** (棒グラフ)
  - **最近10回のセッション一覧**
  - 「きろくを ぜんぶ けす」ボタンで全消去

データは **ブラウザ内にのみ** 保存されるので、プライベートブラウジング / ブラウザを変えた場合は引き継がれません。

---

## 開発環境

- Node.js 18+ (推奨: 20 / 22)
- npm
- 追加の依存は `http-server` のみ (開発中のローカル配信用)

### セットアップ

```bash
git clone <this repo>
cd education_sample_mv
npm install
```

### ローカルで遊ぶ

```bash
npm run dev
# → http://localhost:8080 が自動で開きます
```

ブラウザがキャッシュを拾わないよう `-c-1` を付けて配信しています。

### プロジェクト構成

```
.
├─ public/                 ← 配信される静的ファイルの実体
│  ├─ index.html
│  ├─ styles/style.css
│  └─ js/
│     ├─ app.js            ← エントリ (画面遷移・セッション実行)
│     ├─ storage.js        ← LocalStorage ラッパ
│     ├─ util.js           ← DOM / SVG ヘルパ
│     └─ questions/        ← ジャンル別モジュール
│        ├─ index.js       ← 登録レジストリ & おすすめ構成
│        ├─ season.js
│        ├─ storyMemory.js
│        ├─ leftRight.js
│        ├─ sequence.js
│        ├─ sameShape.js
│        ├─ folktale.js
│        ├─ shiritori.js
│        ├─ missingPiece.js
│        ├─ blocks.js
│        └─ order.js
├─ scripts/
│  ├─ build.mjs            ← public/ → dist/ のコピービルド
│  └─ deploy-gcs.mjs       ← GCS への rsync デプロイ (gcloud)
├─ package.json
└─ README.md
```

すべて **素の ES Module + 素の CSS** で動きます (バンドラ不要)。
新しいジャンルを追加したいときは:

1. `public/js/questions/<id>.js` を作成して `default export` でモジュールを返す
   ```js
   export default {
     id: 'myType', name: 'じぶんの問題', emoji: '✨',
     description: '説明',
     generate() {
       return {
         prompt: 'もんだい',
         render(container) { /* SVG や絵を挿入 */ },
         choices: ['A', 'B', 'C', 'D'],
         answer: 'A',
         explain: 'かいせつ',
       };
     },
   };
   ```
2. `public/js/questions/index.js` の `TYPES` に追加。
3. 必要なら `RECOMMENDED` にも追加。

---

## ビルド

```bash
npm run build
```

`public/` の中身が `dist/` にコピーされます (バンドル・変換なし)。

ビルド結果をローカルで確認:

```bash
npm run preview
# → http://localhost:8081
```

---

## Google Cloud Storage で公開する (gcloud)

**注**: `gsutil` ではなく、すべて `gcloud storage` サブコマンドで完結します。

### 1. 初期設定 (最初の 1 回だけ)

```bash
# gcloud CLI がインストール済みで、プロジェクトが設定されていることを前提
gcloud auth login
gcloud config set project <YOUR_PROJECT_ID>

# バケットを作成 (名前はグローバルにユニーク)
export BUCKET=minerva-kids-game-demo
gcloud storage buckets create gs://${BUCKET} \
  --location=asia-northeast1 \
  --uniform-bucket-level-access

# 静的 Web ホスティング向けに index/404 を設定
gcloud storage buckets update gs://${BUCKET} \
  --web-main-page-suffix=index.html \
  --web-error-page=index.html

# バケットを一般公開 (allUsers に Viewer 権限)
gcloud storage buckets add-iam-policy-binding gs://${BUCKET} \
  --member=allUsers \
  --role=roles/storage.objectViewer
```

### 2. デプロイ

```bash
npm run build
GCS_BUCKET=${BUCKET} npm run deploy:gcs
```

`scripts/deploy-gcs.mjs` は内部で次を実行します:

```bash
gcloud storage rsync ./dist gs://${BUCKET} \
  --recursive --delete-unmatched-destination-objects

gcloud storage objects update gs://${BUCKET}/index.html \
  --cache-control="no-cache, max-age=0"
```

- `rsync` で差分アップロード & 不要ファイル削除。
- `index.html` のみ `Cache-Control: no-cache` にしてアップデートが即時反映されるようにします。
- `dist/js/**.js` と `dist/styles/**.css` はファイル名にハッシュを付けていないので、
  内容を変更したら上記コマンドを再実行すれば上書きされます。

公開 URL の例:

```
https://storage.googleapis.com/<BUCKET>/index.html
```

独自ドメインを使いたい場合は Cloud Load Balancer + Cloud CDN を組み合わせるのが
推奨されますが、このリポジトリの範囲外です。

### 3. サブパス配下に置きたいとき

```bash
GCS_BUCKET=${BUCKET} GCS_PREFIX=minerva-kids npm run deploy:gcs
# → https://storage.googleapis.com/<BUCKET>/minerva-kids/index.html
```

### 4. デプロイ後の動作確認

```bash
# 中身を確認
gcloud storage ls gs://${BUCKET} --recursive

# 1ファイルのメタ確認
gcloud storage objects describe gs://${BUCKET}/index.html
```

---

## よくあるトラブル

- **ブラウザで `CORS error` や `type="module" not allowed`**
  → `index.html` を直接ダブルクリックで開いていませんか？
  ES Modules は `file://` では動きません。必ず `npm run dev` や
  `npm run preview` などのローカルサーバー経由で開いてください。
- **公開 URL で 403**
  → `gcloud storage buckets add-iam-policy-binding ... --member=allUsers --role=roles/storage.objectViewer`
  が実行されているか確認してください。
- **更新が反映されない**
  → ブラウザキャッシュをクリアするか、`index.html` の `Cache-Control: no-cache`
  が設定されているかを `gcloud storage objects describe` で確認します。

---

## ライセンス

MIT License. 詳細は [`LICENSE`](./LICENSE) を参照してください。
