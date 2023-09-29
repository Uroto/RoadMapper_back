import { Injectable } from '@nestjs/common';
import { flowPairType, gptResType } from './generate.interface';
import 'dotenv/config';
import OpenAI from 'openai';
import * as deepl from 'deepl-node';
import { resolve } from 'path';

@Injectable()
export class GenerateService {
    private gptMsg: string =
`
Nest.jsはNode.jsベースのフレームワークで、スケーラビリティのあるWebアプリケーションを構築するための素晴らしいツールです。Nest.jsを学ぶための推奨手順を以下に示します。この手順に従って学習を進めることで、効果的にNest.jsをマスターできるでしょう。
1. Node.jsとnpmのインストール:
Nest.jsはNode.js上で動作します。まず、Node.jsとnpm（Node Package Manager）をインストールして、環境をセットアップします。Node.jsの公式ウェブサイトから最新バージョンをダウンロードし、インストールしてください。
2. TypeScriptの基本を学ぶ:
Nest.jsはTypeScriptを使用していますので、TypeScriptの基本を学びましょう。TypeScriptはJavaScriptのスーパーセットであり、型安全性を提供します。
3. Nest.jsのドキュメントを読む:
Nest.jsの公式ドキュメントは非常に詳細で役立つ情報が豊富にあります。まずはドキュメントを読み始めましょう。基本的なコンセプトやディレクトリ構造について理解しましょう。
4. Nest CLIのインストール:
Nest CLI（Command Line Interface）100をインストールすると、プロジェクトの作成やコードの自動生成などが簡単に行えます。以下のコマンドでインストールします。
\`\`\`
npm install -g @nestjs/cli
\`\`\`
5. 新しいNest.jsプロジェクトの作成:
Nest CLIを使用して新しいプロジェクトを作成します。
\`\`\`
nest new project-name
\`\`\`
6. プロジェクトのセットアップと実行:
プロジェクトフォルダに移動し、必要な依存関係をインストールします。
\`\`\`
cd project-name
npm install
\`\`\`
その後、アプリケーションを起動します。
\`\`\`
npm run start
\`\`\`
7. ルーティングとコントローラの作成:
Nest.jsでは、ルーターとコントローラーを使用してエンドポイントを定義します。新しいルートやコントローラを作成して、APIのエンドポイントを設定しましょう。
8. サービスとDI（Dependency Injection）の理解:
Nest.jsのサービスとDIの概念を理解しましょう。サービスはビジネスロジックを格納する場所です。
9. モジュールの作成:
モジュールはアプリケーションの機能を組織化するために使用されます。新しいモジュールを作成し、コンポーネントを登録してみてください。
10. ミドルウェアとフィルタの使用:
ミドルウェアとフィルタを使用して、リクエストとレスポンスの処理をカスタマイズしましょう。
11. データベースとの連携:
Nest.jsは多くのデータベースとの連携をサポートしています。データベースとの連携を学び、データベース操作を組み込みましょう。
12. テスト:
ユニットテストと統合テストを書き、Nest.jsアプリケーションをテストしましょう。
13. セキュリティと認証:
アプリケーションのセキュリティと認証に関するベストプラクティスを学び、実装しましょう。
14. エラーハンドリングとロギング:
エラーハンドリングとロギングを実装し、アプリケーションのデバッグとトラブルシューティングを行いましょう。
15. プロダクションへのデプロイ:
Nest.jsアプリケーションをプロダクション環境にデプロイする方法を学びましょう。
16. コミュニティとリソースの活用:
Nest.jsのコミュニティやオンラインリソースを活用して、問題を解決し、スキルを向上させましょう。
この手順に従ってNest.jsを学習すると、堅牢でスケーラブルなWebアプリケーションを開発するための基本的なスキルを習得できます。学習プロセスは自己学習と実践が重要ですので、実際のプロジェクトでNest.jsを使用してみることをお勧めします。`;

    private readonly openAI = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
    private readonly translator = new deepl.Translator(process.env.DEEPL_API_KEY);

    private gptResponse: gptResType = {
        word: '',
        topic: '',
        flow: []
    };

    async generate(word: string) {
        const params: OpenAI.Chat.ChatCompletionCreateParams = {
            model: 'gpt-3.5-turbo-0613',
            messages: [{ role: 'user', content: `Please describe the steps to learn ${word} in as short a step-by-step sequence as possible.` }],
            stream: false,
        };
    
        const completion: OpenAI.Chat.ChatCompletion = await this.openAI.chat.completions.create(params);
        await this.translateSentence(completion.choices[0].message.content)
            .then(res => {
                this.gptMsg = res;
            });
    }

    async translateSentence(str: string): Promise<string> {
        const res = await this.translator.translateText(str, 'en', 'ja');
        return res.text;
    }

    async translateWord(word: string): Promise<string> {
        const res = await this.translator.translateText(word, null, 'en-US');
        return res.text;
    }
    

    private strSplit(): void {
        const flow: flowPairType[] = [];
        let order = 1;
        let title: string = "";
        let str = '';
        for (let i = 0; i < this.gptMsg.length; i++) {
            const char = this.gptMsg.charAt(i);

            if (char >= '0' && char <= '9') {
                // 数字が開始された場所を見つける
                let j = i;
    
                // 連続する数字を集める
                while (j < this.gptMsg.length && this.gptMsg.charAt(j) >= '0' && this.gptMsg.charAt(j) <= '9') {
                    j++;
                }
    
                const number = parseInt(this.gptMsg.substring(i, j));
                if (number === order) {
                    if (order === 1) {
                        this.gptResponse.topic = str;
                    } else {
                        flow.push({num: order - 1, title: title, flow: str});
                    }
                    order++;
                    str = '';
                    title ='';
                    i = j; // 数字の後の位置にジャンプ
                } else {
                    str += this.gptMsg.substring(i, j);
                    i = j - 1; // 次のループのために位置を調整
                }
            } else if (char === ':' || char === '：') {
                title = str;
                str = "";
            } else {
                str += char;
            }
        }

        flow.push({num: order - 1, title: title, flow: str});

        this.gptResponse.flow = flow;
    }

    async gptRes(word: string): Promise<gptResType> {
        // const translatedWord = await this.translateWord(word);
        // await this.generate(translatedWord);
        await new Promise(resolve => setTimeout(resolve, 3000));
        this.strSplit();
        // this.gptResponse.word = translatedWord;
        return this.gptResponse;
    }
}
