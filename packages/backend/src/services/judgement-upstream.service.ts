import axios from 'axios';
import { config } from '@/config';
import { LuoguJudgementResponseSchema, type LuoguJudgementResponse } from '@/shared/judgement';

const MAX_RESPONSE_BYTES = 10 * 1024 * 1024;

export interface JudgementUpstreamResult {
    data: LuoguJudgementResponse;
    rawResponse: string;
}

function upstreamFailure(error: unknown): Error {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const code = typeof error.code === 'string' ? error.code : undefined;
        return new Error(
            status
                ? `Luogu judgement request failed with HTTP ${status}`
                : `Luogu judgement request failed${code ? ` (${code})` : ''}`
        );
    }
    return new Error('Luogu judgement request failed');
}

export class JudgementUpstreamService {
    static async fetch(): Promise<JudgementUpstreamResult> {
        try {
            const response = await axios.get<unknown>(config.judgement.sourceUrl, {
                timeout: config.network.timeout,
                maxRedirects: 0,
                maxContentLength: MAX_RESPONSE_BYTES,
                maxBodyLength: MAX_RESPONSE_BYTES,
                decompress: true,
                validateStatus: status => status >= 200 && status < 300,
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Accept-Language': 'zh-CN,zh;q=0.9',
                    'Cache-Control': 'no-cache',
                    Pragma: 'no-cache',
                    Referer: 'https://www.luogu.com.cn/judgement',
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            const parsed = LuoguJudgementResponseSchema.safeParse(response.data);
            if (!parsed.success) throw new Error('Luogu judgement response validation failed');
            return { data: parsed.data, rawResponse: JSON.stringify(response.data) };
        } catch (error) {
            if (error instanceof Error && error.message.includes('validation failed')) throw error;
            throw upstreamFailure(error);
        }
    }
}
