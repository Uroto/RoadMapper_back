import { Injectable } from '@nestjs/common';
import { flowPairType, gptResType } from './generate.interface';
import 'dotenv/config';
import OpenAI from 'openai';
import * as deepl from 'deepl-node';

@Injectable()
export class GenerateService {
    private gptMsg: string = "";
    private readonly openAI = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
    private readonly translator = new deepl.Translator(process.env.DEEPL_API_KEY);

    private gptResponse: gptResType = {
        word: '',
        topic: '',
        flow: []
    };

    async generate(word: string, level: string, time: string) {
        const params: OpenAI.Chat.ChatCompletionCreateParams = {
            model: 'gpt-3.5-turbo-0613',
            messages: [{ role: 'user', content: `Please tell me how to learn ${word} in ${time}, in order and as concisely as possible for a ${level}. (format: 1. title:content 2. ...)` }],
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
                        this.gptResponse.topic = str.trim();
                    } else {
                        flow.push({num: order - 1, title: title, flow: str.trim()});
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

        flow.push({num: order - 1, title: title, flow: str.trim()});

        this.gptResponse.flow = flow;
    }

    async gptRes(word: string, level: string, time: string): Promise<gptResType> {
        const translatedWord = await this.translateWord(word);
        await this.generate(translatedWord, level, time);
        this.strSplit();
        this.gptResponse.word = translatedWord;
        return this.gptResponse;
    }
}
