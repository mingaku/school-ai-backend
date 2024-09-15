# school-ai-backend

## 概要
このリポジトリは、スクールAIで生成AIのAPIを実行するためのエンドポイントを管理しています。


## クイックスタート

依存関係をインストール:
```console
$ npm install
```

サーバーを起動:
```console
$ node index.js
```

## デプロイ手順
 

以下のコマンドを実行してデプロイします (参考記事：https://qiita.com/riku-shiru/items/d3f7dda5a5e87c4b26e9): 
```console
$ gcloud builds submit --project chatgpt-teacher --tag gcr.io/chatgpt-teacher/gpt && gcloud beta run deploy school-ai --image gcr.io/chatgpt-teacher/gpt --platform managed
```

## 注意事項
- 現在、Local, Staging, Production 環境は共通のバックエンドを使用しています。（Cloud Run の費用削減が目的）
- 将来的には、各環境（Local, Staging, Production）に個別のデプロイ手順と環境を整備する必要があります。

|AsIs|ToBe|
|---|---|
|<img width="751" alt="image" src="https://github.com/user-attachments/assets/5583880f-5d59-4d8a-a8ed-4d0a3463793e">|<img width="734" alt="image" src="https://github.com/user-attachments/assets/1a71245f-d2c2-46dd-ad86-cefe3cb554d1">|
