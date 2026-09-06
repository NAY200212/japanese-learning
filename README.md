# 日本語学習プラットフォーム（Japanese Learning Platform）

JLPT（N3–N5）対策のための**フロントエンド/バックエンド分離型 日本語学習プラットフォーム**です。単語暗記、五十音練習、模擬テスト、過去問練習、誤答ノート、毎日チェックイン、SRS 間隔復習、学習統計をまとめて搭載し、**AI 日本語アシスタント**（DeepSeek：誤答解析・単語例文・文法Q&A・多ターン記憶のストリーミング対話）を内蔵しています。バックエンドは Spring Boot 3 + MyBatis + MySQL/TiDB + Redis、フロントエンドは素の HTML/CSS/JavaScript、Docker Compose によるワンコマンド起動に対応しています。

> 本プロジェクトは **Java バックエンドエンジニアの就職用ポートフォリオ**です。バックエンドの階層アーキテクチャ、RESTful API 設計、JWT 認証、Redis キャッシュ、SRS アルゴリズム実装、定期タスク、Docker デプロイ、クラウドデータベース連携などの能力を重点的に示しています。

---

## ✨ 機能一覧

| モジュール | 説明 |
|------|------|
| ユーザー認証 | 登録 / ログイン、JWT Token 認可、パスワードは BCrypt で暗号化保存 |
| 単語帳 | N3 / N4 / N5 の **1,377 語**を内蔵。ページング・分類検索に対応 |
| 五十音練習 | 平仮名 / 片仮名の対照練習、クリックで発音 |
| 模擬テスト | 問題集からランダム出題（**120 問 / 480 選択肢**）、自動採点 |
| 過去問練習 | JLPT 過去問スタイルの問題を1問ずつ解答、解説付き |
| 誤答ノート | 誤答を自動収集、やり直し・削除に対応 |
| 毎日チェックイン | 学習チェックイン、連続日数を記録 |
| SRS 復習 | **SM-2 間隔反復アルゴリズム**による単語復習。忘却曲線に沿って復習をスケジュール |
| 毎日統計 | 定期タスクで毎日の学習データを集計し、トレンド表示 |
| AI アシスタント | **DeepSeek（Spring AI / OpenAI 互換プロトコル）**を統合：誤答解析・単語例文・文法Q&A。連続対話は **SSE ストリーミングのタイプライター出力 + Redis 多ターン記憶（約10ターン / 7日間）** に対応 |

## 🛠 技術スタック

### バックエンド
- **Spring Boot 3.4.1**（Java 17）— Web アプリケーションフレームワーク。自動構成と Starter エコシステム
- **MyBatis 3.0.4** — 永続化フレームワーク。XML/アノテーション SQL マッピング、`#{}` プリコンパイルで SQL インジェクション防止
- **MySQL 8 / TiDB Cloud Serverless** — 業務データベース（ローカル Docker / クラウド互換）
- **Redis 7 / Upstash Redis** — キャッシュとオンライン状態（`word:*` キャッシュ群、AI 多ターン記憶・Q&A キャッシュ）
- **Spring AI（openai starter 1.0.0-M6）** — 大規模言語モデル呼び出しを統一抽象化し、OpenAI 互換プロトコルで DeepSeek に接続
- **DeepSeek（deepseek-chat）** — AI 対話モデル。`ChatModel.stream` で SSE ストリーミング出力
- **SseEmitter + Reactor** — ストリーミング応答のプッシュと購読キャンセル管理
- **JJWT 0.12.6** — ステートレスなログイン状態（JWT 発行・検証）
- **Spring Security Crypto** — BCrypt パスワードハッシュ
- **springdoc-openapi 2.8.9** — Swagger UI / OpenAPI ドキュメント（`/doc.html`）
- **Lombok** — ボイラープレートコード削減
- **AOP ログ** — WebLogAspect で API 呼び出しログを一元的に記録
- **Spring Task** — `@Scheduled` による毎日統計の定期タスク

### フロントエンド
素の **HTML + CSS + JavaScript**（ES Module 化）：`fetch` で REST API を呼び出し、`localStorage` でログイン状態を永続化、JS ファイルをモジュール単位で分割。

### 開発基盤 / デプロイ
- **Docker / Docker Compose** — 3 コンテナ構成：mysql(3308) + redis(6380) + backend(8080)
- **Maven マルチステージビルド** — `maven:3.9-eclipse-temurin-17` → `eclipse-temurin:17-jre`
- **TiDB Cloud Serverless** — クラウドデータベース（MySQL プロトコル互換、TLS 接続）
- **Upstash Redis** — クラウド Redis（TLS + パスワード）
- **Hugging Face Spaces (Static)** — フロントエンド静的ホスティング
- **localhost.run SSH トンネル + launchd デーモン** — バックエンドの一時的な公開（本機デモ用）

## 🏗 アーキテクチャ図

```
┌─────────────────────────┐        ┌──────────────────────────┐
│     フロントエンド       │        │         バックエンド      │
│  frontend/ (HTML/JS)     │  HTTP  │ Spring Boot 3.4.1        │
│  · index.html ログイン   │ ─────► │  Controller → Service    │
│  · app.html   メイン     │  /api  │  → Mapper → MySQL/TiDB   │
│  · js/ 10モジュール      │        │  JWT インターセプタ      │
└─────────────────────────┘        │  Redis キャッシュ        │
                                    └────────────┬─────────────┘
                                                │
                                    ┌───────────┴───────────┐
                                    │ MySQL 8 (ローカルDocker)│
                                    │ TiDB Cloud (クラウド)  │
                                    │ Redis 7 (キャッシュ)   │
                                    └───────────┬───────────┘
                                               │
                                               │ Spring AI (OpenAI 互換プロトコル)
                                               ▼
                              ┌──────────────────────────┐
                              │ DeepSeek API（外部モデル）│
                              │ https://api.deepseek.com  │
                              └──────────────────────────┘
```

**リクエスト経路**：ブラウザ → フロントエンド静的ページ → `fetch(/api/...)` → Spring Boot（JwtInterceptor 認証）→ Service 業務ロジック → MyBatis Mapper → MySQL/TiDB。ホットデータは Redis キャッシュ（`word:*`）を経由。

## 🚀 クイックスタート（ローカル Docker）

```bash
# 1. リポジトリをクローン
git clone git@github.com:NAY200212/japanese-learning.git
cd japanese-learning

# 2. ワンコマンド起動（mysql:3308 + redis:6380 + backend:8080）
docker compose up -d --build

# 3. データベース初期化
docker exec -i japanese-learning-mysql-1 mysql -uroot -proot japanese_learning < sql/init_tables.sql
docker exec -i japanese-learning-mysql-1 mysql -uroot -proot japanese_learning < sql/seed_words_n5_more.sql
docker exec -i japanese-learning-mysql-1 mysql -uroot -proot japanese_learning < sql/seed_words_n4.sql
docker exec -i japanese-learning-mysql-1 mysql -uroot -proot japanese_learning < sql/seed_words_n3.sql
docker exec -i japanese-learning-mysql-1 mysql -uroot -proot japanese_learning < sql/seed_questions_jlpt.sql

# 4. アクセス
# バックエンド API ドキュメント（Swagger）: http://localhost:8080/doc.html
# API サンプル:            http://localhost:8080/api/word/list?page=1&pageSize=5
```

### Docker を使わないローカル起動

```bash
# バックエンド
cd src/main/java/com/japaneselearning/ && mvn spring-boot:run   # ローカル MySQL(3306) + Redis(6379) が必要

# フロントエンド（純静的。直接開くか、任意の静的サーバーを起動）
cd frontend && python3 -m http.server 3000
# http://localhost:3000/index.html にアクセス
```

## 🌐 オンラインデモ（一時的）

| 項目 | アドレス | 説明 |
|------|------|------|
| フロントエンド | https://nay20024-japanese-frontend.static.hf.space/index.html | Hugging Face Static Space でホスティング |
| バックエンド API | https://1d531354277d9d.lhr.life/api | localhost.run SSH トンネル。**デモ用の一時アドレスのため変更される場合あり** |

> 注意：バックエンドの公開アドレスは本機の SSH トンネルに依存する**一時デモ構成**です（launchd デーモンによる自動再起動 + フロントエンド同期を設定済み）。正式なクラウドデプロイ後はアドレスが長期安定します。

## ⚙️ 環境変数

バックエンドは全設定を環境変数化済み（`application.yml` 参照）。クラウドデプロイ時は以下の 7 項目を注入します：

| 変数 | 説明 | 例 |
|------|------|------|
| `MYSQL_URL` | データベース JDBC URL | `jdbc:mysql://host:4000/japanese_learning?...` |
| `MYSQL_USER` | データベースユーザー名 | `root` |
| `MYSQL_PASSWORD` | データベースパスワード | `your-password` |
| `REDIS_HOST` | Redis ホスト | `new-lacewing-105715.upstash.io` |
| `REDIS_PORT` | Redis ポート | `6379` |
| `REDIS_PASSWORD` | Redis パスワード | `your-password` |
| `REDIS_SSL` | Redis TLS を有効にするか | `true` |
| `DEEPSEEK_API_KEY` | DeepSeek API キー（AI アシスタントに必須。環境変数からのみ読み取り、リポジトリには保存しない） | `sk-...` |

ローカルデフォルト（docker-compose）：MySQL `localhost:3308`、Redis `localhost:6380`。

## 📁 ディレクトリ構成

```
japanese-learning/
├── src/main/java/com/japaneselearning/
│   ├── controller/     # 12 個の REST コントローラ（AiController 含む）
│   ├── service/        # 業務レイヤーのインターフェース + impl（SM-2、AiService / AiChatService 含む）
│   ├── mapper/         # MyBatis Mapper（13 個）
│   ├── entity/         # エンティティクラス（13 個、14 テーブルに対応）
│   ├── dto/            # リクエスト/レスポンス DTO
│   ├── config/         # WebConfig / JwtInterceptor / RedisConfig / OpenApiConfig / WebLogAspect
│   ├── common/         # Result<T> / PageResult<T> 統一レスポンス
│   ├── util/           # JwtUtil
│   ├── task/           # DailyStatsTask 毎日統計の定期タスク
│   └── exception/      # グローバル例外処理
├── frontend/
│   ├── index.html      # ログインページ
│   ├── app.html        # メインアプリページ
│   ├── css/style.css
│   └── js/             # api.js / auth.js / word.js / quiz.js / exam.js / kana.js / checkin.js / wrong.js / ai.js / app.js
├── sql/                # テーブル作成 + シードデータ（1,377 語 / 120 問）
├── docker/             # Docker initdb スクリプト
├── Dockerfile          # Maven マルチステージビルド
├── docker-compose.yml  # mysql(3308) + redis(6380) + backend(8080)
└── docs/screenshots/   # プロジェクトスクリーンショット
```

## 📸 スクリーンショット

| ログインページ | フロントエンド公開ページ |
|--------|-----------|
| ![ログインページ](docs/screenshots/frontend_login_page.png) | ![フロントエンド公開ページ](docs/screenshots/frontend_static_hf.png) |

## 📊 データ規模

- 単語 **1,377 語**（N5 / N4 / N3 のレベル別）
- テスト問題集 **120 問 / 480 選択肢**（JLPT 過去問スタイル）
- データベース **14 テーブル**：user / word / question / question_option / answer_record / wrong_book / word_review / daily_checkin / daily_stats / exam_record など

## 🔑 設計の要点

1. **JWT ステートレス認証**：ログインで Token を発行し、`JwtInterceptor` が一括で検証。フロントエンドは `localStorage` に保持。
2. **MyBatis `#{}` プリコンパイル**：SQL インジェクションを防止。動的条件は `<script><if>` + `WHERE 1=1`。
3. **Redis キャッシュ**：単語のホットデータを `word:*` にキャッシュし、DB 負荷を軽減。データ修正後はキャッシュクリアが必要。
4. **SM-2 間隔反復アルゴリズム**：ユーザーの復習フィードバック（やり直し/難しい/良好/簡単）に応じて次回復習間隔と習熟度を動的調整。
5. **統一レスポンス**：`Result<T>` で API レスポンスをラップし、`PageResult<T>` でページング構造を統一。
6. **AOP インターフェースログ**：`@Aspect` アスペクトでリクエストパス・処理時間を記録し、調査・デモに活用。
7. **毎日統計の定期タスク**：`@Scheduled` で毎日、学習時間 / チェックイン / 復習データを集計。
8. **環境変数化された設定**：同一コードでローカル Docker とクラウド TiDB / Upstash をシームレスに切替可能。
9. **Spring AI による統一モデル接続**：`spring-ai-openai-spring-boot-starter` を追加し base-url を DeepSeek に向けるだけ（OpenAI 互換プロトコル）。業務レイヤーは `ChatModel` に対してプログラミングし、特定ベンダーを意識しないため、将来 GPT / 通義などへスムーズに切替可能。
10. **SSE ストリーミング対話**：`SseEmitter` + `ChatModel.stream` で差分をプッシュ。フロントエンドは `fetch` ReadableStream でデコード + タイプライター描画。タイムアウト / 切断時は自動で `dispose` して購読を解除しリークを防止。
11. **AI 多ターン記憶**：Redis `ai:chat:{sessionId}` に直近 20 件（約10ターン）の user/assistant メッセージを保存（TTL 7日）。セッションは JWT userId（ログイン時）または `X-Chat-Session`（ゲスト時）で識別し、Redis 異常時は自動で記憶なしの直結にフォールバック。
12. **AI Q&A 短時間キャッシュ**：同一質問の結果を Redis に書き込み（TTL 10分）、重複課金を防止。キャッシュ読み取り失敗時は自動で直結にフォールバック。

## 🗺 Roadmap

- [ ] バックエンドのクラウド化（長期稼働可能なクラウドへデプロイし、ローカル SSH トンネルを置換）
- [ ] 単語の発音音声
- [ ] モバイル対応 / PWA
- [ ] JLPT 過去問の追加

---

MIT License © 2026 [NAY200212](https://github.com/NAY200212)

