import { requestId, requestIdwithoutFactoryId, requestIdwithoutCallback } from '../../utils/api/id';
import { allureReporter } from '../../utils/report';
import { base64encode, hexEncode } from '../../utils/string';
import environment from '../../config';
import { OK, BAD_REQUEST } from 'http-status';
import { ERROR } from '../../utils/schema';
import { generateFactoryID } from '../../utils/generators';



describe('ID service tests', () => {
    beforeEach(() => {
        allureReporter().epic('Id application').feature('Id requests').story('FRP-1');
    });

    test('ID service should return 200 OK', async () => {
        const response = await requestId(generateFactoryID(1000, 9000), base64encode(environment.mockUrl))
        response.assertStatus(OK);
    });

    const invalidFactoryIds = ['-1', '20001', 'abc'];
    for (const invalidId in invalidFactoryIds) {
        test(`ID service should return 400 with proper Error for invalid factory ID: ${invalidId} `, async () => {
            const response = await requestId(invalidId, base64encode(environment.mockUrl));
            const valueA = await response.parse();
            response.assertStatus(BAD_REQUEST);
            expect(valueA).toMatchSchema(ERROR);
            expect(valueA.error).toBe(`Factory ${invalidId} is not valid!`);
        });
    }

    const invalidCallacks = [hexEncode(environment.mockUrl), 'http://lm', base64encode('abc')];
    for (const callback of invalidCallacks) {
        test(`ID service should return 400 with proper Error for invalid callback url, data: ${callback}`, async () => {
            const responseA = await requestId(generateFactoryID(1000, 9000), callback)
            const valueA = await responseA.parse();
            responseA.assertStatus(BAD_REQUEST);
            expect(valueA).toMatchSchema(ERROR);
            expect(valueA.error).toBe('Callback URL is not valid base64 encoded URL!');
        });
    }

    test('ID service should return 400 with proper Error for missing factory ID', async () => {
        const response = await requestIdwithoutFactoryId(base64encode(environment.mockUrl))
        const value = await response.parse();
        response.assertStatus(BAD_REQUEST);
        expect(value).toMatchSchema(ERROR);
        expect(value.error).toBe('factoryId is not set!');
    });

    test('ID service should return 400 with proper Error for missing callback url', async () => {
        const response = await requestIdwithoutCallback(generateFactoryID(1000, 9000));
        const value = await response.parse();
        response.assertStatus(BAD_REQUEST);
        expect(value).toMatchSchema(ERROR);
        expect(value.error).toBe('callback is not set!');
    });

});