import { describe, expect, it } from 'vitest';
import { serializeJudgementParams } from '../src/api/judgement-query';

describe('judgement query serialization', () => {
    it('serializes arrays as comma-separated values and omits absent fields', () => {
        expect(
            serializeJudgementParams({
                page: 2,
                uid: [12, 34],
                rev_perm: [64, 32768],
                name: 'user name',
                no_perm: undefined
            })
        ).toBe('page=2&uid=12%2C34&rev_perm=64%2C32768&name=user+name');
    });
});
