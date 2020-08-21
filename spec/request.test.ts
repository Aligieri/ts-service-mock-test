import { requestId, requestIdwithoutFactoryId, requestIdwithoutCallback } from '../utils/api/id';
import { allureReporter } from '../utils/report';
import { base64encode, hexEncode } from '../utils/string';
import environment from '../config';
import { OK, BAD_REQUEST } from 'http-status';
import { ERROR } from '../utils/schema';
import { generateFactoryID } from '../utils/generators';

describe('ID service tests', () => {
    const INVALID_FACTORY_IDS = ['-1', '20001', 'abc'];
    const INVALID_CALLBACKS = [hexEncode(environment.mockUrl), 'http://lm', base64encode('abc')];

    beforeEach(() => {
        allureReporter()
            .epic('ID application')
            .feature('Requesting ID')
            .story('FRP-1');
    });

    test('ID service should return 200 OK', async () => {
        reporter.addLabel('tag', 'TC-1');

        const idRequest = await requestId(generateFactoryID(1000, 9000), base64encode(environment.mockUrl))
        idRequest.assertStatus(OK);
    });

    for (const invalidId of INVALID_FACTORY_IDS) {
        test(`ID service should return 400 with proper Error for invalid factory ID: ${invalidId}`, async () => {
            reporter.addLabel('tag', 'TC-2');

            const idRequest = await requestId(invalidId, base64encode(environment.mockUrl));
            idRequest.assertStatus(BAD_REQUEST);

            const idRequestResponse = await idRequest.parse();
            expect(idRequestResponse).toMatchSchema(ERROR);
            expect(idRequestResponse.error).toBe(`Factory ${invalidId} is not valid!`);
        });
    }

    for (const callback of INVALID_CALLBACKS) {
        test(`ID service should return 400 with proper Error for invalid callback url, data: ${callback}`, async () => {
            reporter.addLabel('tag', 'TC-3');

            const idRequest = await requestId(generateFactoryID(1000, 9000), callback);
            idRequest.assertStatus(BAD_REQUEST);

            const idRequestResponse = await idRequest.parse();
            expect(idRequestResponse).toMatchSchema(ERROR);
            expect(idRequestResponse.error).toBe('Callback URL is not valid base64 encoded URL!');
        });
    }

    test('ID service should return 400 with proper Error for missing factory ID', async () => {
        reporter.addLabel('tag', 'TC-4');

        const idResponse = await requestIdwithoutFactoryId(base64encode(environment.mockUrl))
        idResponse.assertStatus(BAD_REQUEST);

        const idRequestResponse = await idResponse.parse();
        expect(idRequestResponse).toMatchSchema(ERROR);
        expect(idRequestResponse.error).toBe('factoryId is not set!');
    });

    test('ID service should return 400 with proper Error for missing callback url', async () => {
        reporter.addLabel('tag', 'TC-5');

        const idResponse = await requestIdwithoutCallback(generateFactoryID(1000, 9000));
        idResponse.assertStatus(BAD_REQUEST);

        const idRequestResponse = await idResponse.parse();
        expect(idRequestResponse).toMatchSchema(ERROR);
        expect(idRequestResponse.error).toBe('callback is not set!');
    });

});