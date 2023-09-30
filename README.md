<div align="center">
  <img src="./img/logo.png" width="70%">
  <div>新しい学びに最適な手順を</div>
</div>

# RoadMapper
<div align="center">
  <img src="./img/top.png" width="90%">
  <img src="./img/content.png" width="90%">
</div>

## バックエンド仕様
### API
- (オリジン)/generateを叩くと以下gptResTypeのjson形式のHTTPレスポンスが返る
```typescript
export interface gptResType {
  word: string;
  topic: string;
  flow: flowPairType[];
}

export interface flowPairType {
  num: number;
  title: string;
  flow: string;
}
```
- flowPairType型はフロントから受け取った学習対象に対しての学習手順をChatGPTのプロンプトに入れ、応答を分割し格納した
- ChatGPTへの学習対象はDeepLで翻訳し、質問自体は英語で行う  
→英語での応答を全てDeepLで翻訳

## 使用技術
- TypeScript
- Nest.js  

(関連)
- dotenv
- ChatGPT API
- DeepL API

## 課題
- 応答文の形式が定まらないことから分割が上手くいかない場合が生じる  
→質問文でより詳細に形式を指定等