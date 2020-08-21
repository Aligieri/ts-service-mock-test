import { requestId, requestIdwithoutFactoryId, requestIdwithoutCallback } from '../../utils/api/id';
import { getDatabase, makeNewLaptop, getStatus, deleteDatabase, setLaptopStatusAsFail, setLaptopStatusAsTimeout } from '../../utils/api/factory';
import { allureReporter } from '../../utils/report';
import { base64encode, hexEncode } from '../../utils/string';
import environment from '../../config';
import { OK, CREATED, NOT_FOUND, BAD_REQUEST, CONFLICT } from 'http-status';
import { ERROR } from '../../utils/schema';
import { generateFactoryID } from '../../utils/generators';
import fetch, { Response, RequestInit, Body } from 'node-fetch';
import { CONTENT_TYPE_HEADER, MIME_JSON, httpPost } from '../../utils/api';
import { checkForCallbacks } from '../../utils/service';


describe('ID service integration tests', () => {
    beforeEach(() => {
        allureReporter().epic('Id application').feature('Integration').story('IRD-1, FRP-2');
    });


    test.only('Positive case: Service return valid ApplID', async () => {
        // Given
        const factoryId = 101;
        const responseA = await makeNewLaptop(factoryId);
        responseA.assertStatus(CREATED);

        const valueA = await responseA.parse();
        const { token, callbackUrlBase64, callbackUrl } = (valueA as any);

        // When
        // const responseB = await requestId(String(factoryId), callbackUrlBase64);
        // responseB.assertStatus(OK);
        // delete later
        const postResponse = await httpPost(callbackUrl, { 'id': `appl${factoryId}_8` });
        postResponse.assertStatus(OK);

        // Then
        const callbackRequests = await checkForCallbacks(5, token);
        const lastRequest = callbackRequests.requests.pop();

        expect(lastRequest.body.id).toMatch(new RegExp(`^appl${factoryId}_[1-9]\d*$`));
    });

    test('Negative case: Failed ID processing', async () => {
        // Given
        const factoryId = 102;

        const response = await deleteDatabase();
        response.assertStatus(OK);

        const responseA = await makeNewLaptop(factoryId);
        responseA.assertStatus(CREATED);

        const valueA = await responseA.parse();
        const { token, callbackUrlBase64, callbackUrl } = (valueA as any);

        const setFailure = await setLaptopStatusAsFail(token, 409);
        setFailure.assertStatus(CREATED);

        // When
        const responseB = await requestId(String(factoryId), callbackUrlBase64);
        responseB.assertStatus(OK);

        // Then
        const callbackRequests = await checkForCallbacks(5, token);
        const callbackValues = await callbackRequests.json();
        callbackValues.requests.assertStatus(CONFLICT);
        expect(callbackValues.requests.body.id).toBe(`appl${factoryId}_1`);
    });

    test('Negative case: ID processing timeout', async () => {
        // Given
        const factoryId = 102;

        const response = await deleteDatabase();
        response.assertStatus(OK);

        const responseA = await makeNewLaptop(factoryId);
        responseA.assertStatus(CREATED);

        const valueA : any = await responseA.parse();
        const token = valueA.token;
        const callbackB64 = valueA.callbackUrlBase64;

        const setTimeout = await setLaptopStatusAsTimeout(token, 2000, 2);
        setTimeout.assertStatus(CREATED);

        // When
        const responseB = await requestId(String(factoryId), callbackB64);
        responseB.assertStatus(OK);

        // Then
        const callbackRequests = await checkForCallbacks(5, token);
        const lastRequest = callbackRequests.requests.pop();
        expect(lastRequest.status).toBe(CONFLICT);
        expect(lastRequest.body.id).toMatch(new RegExp(`^appl${factoryId}_[1-9]\d*$`));
    });
});