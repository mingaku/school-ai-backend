# school-ai-backend

## Quick Start

Install dependencies:
```console
$ npm install
```

Start the server:
```console
$ npm install
```

## How to deploy 

Run following: (参考記事：https://qiita.com/riku-shiru/items/d3f7dda5a5e87c4b26e9): 
```console
$ gcloud builds submit --project chatgpt-teacher --tag gcr.io/chatgpt-teacher/gpt && gcloud beta run deploy school-ai --image gcr.io/chatgpt-teacher/gpt --platform managed
```

## Note
- 現状は、Local, Stg, Prodでバックエンドを共通利用している (Cloud runの費用削減が目的)
- 今後はToBeのようにLocal, Stg, Prodに対するデプロイ手順と環境を構築する

|AsIs|ToBe|
|---|---|
|<img width="751" alt="image" src="https://github.com/user-attachments/assets/5583880f-5d59-4d8a-a8ed-4d0a3463793e">|<img width="734" alt="image" src="https://github.com/user-attachments/assets/1a71245f-d2c2-46dd-ad86-cefe3cb554d1">|
