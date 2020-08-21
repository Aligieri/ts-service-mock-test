import { requestId } from '../utils/api/id';
import { makeNewLaptop, deleteDatabase, setLaptopStatusAsFail, setLaptopStatusAsTimeout } from '../utils/api/factory';
import { allureReporter } from '../utils/report';
import { OK, CREATED, CONFLICT, REQUEST_TIMEOUT } from 'http-status';
import { httpPost } from '../utils/api';
import { checkForCallbacks } from '../utils/service';
import { generateFactoryID } from '../utils/generators';

describe('ID service integration tests', () => {
    beforeEach(() => {
        allureReporter().epic('Id application').feature('Integration').story('IRD-1, FRP-2');
    });


    test('Positive case: Service return valid ApplID', async () => {
        reporter.addLabel('tag', 'TC-6');

        // Given
        const factoryId = generateFactoryID(14000, 15000);
        const laptop = await makeNewLaptop(factoryId);
        laptop.assertStatus(CREATED);

        const { token, callbackUrlBase64, callbackUrl } = await laptop.parse();

        // When
        if (process.env.MOCK_ID_APPLICATION) {
            const mockCallback = await httpPost(callbackUrl, { id: `appl${factoryId}_8` });
            mockCallback.assertStatus(OK);
        } else {
            const idRequest = await requestId(factoryId, callbackUrlBase64);
            idRequest.assertStatus(OK);
        }

        // Then
        const { requests: callbackRequests } = await checkForCallbacks(5, token);
        const request = callbackRequests[0];
        expect(request.status).toBe(OK);
        expect(request.body.id).toMatch(new RegExp(`^appl${factoryId}_[1-9]\d*$`));
    });

    test('Negative case: Failed ID processing', async () => {
        reporter.addLabel('tag', 'TC-11');

        // Given
        const factoryId = generateFactoryID(14000, 15000);
        const laptop = await makeNewLaptop(factoryId);
        laptop.assertStatus(CREATED);

        const { token, callbackUrlBase64, callbackUrl } = await laptop.parse();

        const setFailure = await setLaptopStatusAsFail(token, CONFLICT);
        setFailure.assertStatus(CREATED);

        // When
        if (process.env.MOCK_ID_APPLICATION) {
            const mockCallback = await httpPost(callbackUrl, { id: `appl${factoryId}_8` });
            mockCallback.assertStatus(CONFLICT);
        } else {
            const idRequest = await requestId(factoryId, callbackUrlBase64);
            idRequest.assertStatus(OK);
        }

        // Then
        const { requests: callbackRequests } = await checkForCallbacks(5, token);
        const request = callbackRequests[0];
        expect(request.status).toBe(CONFLICT);
        expect(request.body.id).toMatch(new RegExp(`^appl${factoryId}_[1-9]\d*$`));
    });

    test('Negative case: ID processing timeout', async () => {
        reporter.addLabel('tag', 'TC-16');

        // Given
        const factoryId = generateFactoryID(14000, 15000);
        const laptop = await makeNewLaptop(factoryId);
        laptop.assertStatus(CREATED);

        const { token, callbackUrlBase64, callbackUrl } = await laptop.parse();

        const setTimeout = await setLaptopStatusAsTimeout(token, 2000, 2);
        setTimeout.assertStatus(CREATED);

        // When
        if (process.env.MOCK_ID_APPLICATION) {
            const mockCallback = await httpPost(callbackUrl, { id: `appl${factoryId}_8` });
            mockCallback.assertStatus(REQUEST_TIMEOUT);
        } else {
            const idRequest = await requestId(factoryId, callbackUrlBase64);
            idRequest.assertStatus(OK);
        }

        // Then
        const { requests: callbackRequests } = await checkForCallbacks(5, token);
        const request = callbackRequests[0];
        expect(request.status).toBe(REQUEST_TIMEOUT);
        expect(request.body.id).toMatch(new RegExp(`^appl${factoryId}_[1-9]\d*$`));
    });
});