import { Injectable } from '@nestjs/common';
import { flowPairType, gptResType } from './generate.interface';
import 'dotenv/config';
import OpenAI from 'openai';

@Injectable()
export class GenerateService {
    private gptMsg: string = "";
    private readonly openAI = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

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
        this.gptMsg = completion.choices[0].message.content;
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
                        this.gptResponse.topic = str.trim();
                    } else {
                        flow.push({num: order - 1, title: title, flow: str.trim()});
                    }
                    order++;
                    str = '';
                    i = j; // 数字の後の位置にジャンプ
                } else {
                    str += this.gptMsg.substring(i, j);
                    i = j - 1; // 次のループのために位置を調整
                }
            } else if (char === ':' || char === '-') {
                title = str;
                str = "";
            } else {
                str += char;
            }
        }

        flow.push({num: order - 1, title: title, flow: str.trim()});

        this.gptResponse.flow = flow;
    }

    async gptRes(word: string): Promise<gptResType> {
        await this.generate(word);
        this.strSplit();
        this.gptResponse.word = word;
        return this.gptResponse;
    }
}
