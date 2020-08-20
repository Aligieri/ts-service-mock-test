import { requestId } from '../../utils/api/id';
import { allureReporter } from '../../utils/report';
import { base64encode, hexEncode } from '../../utils/string';
import environment from '../../config';
import {OK, CREATED, NOT_FOUND, BAD_REQUEST} from 'http-status';
import { ERROR } from '../../utils/schema';
import { generateFactoryID } from '../../utils/generators';


describe('ID service tests', () => {
    beforeEach(() => {
        allureReporter().epic('FRP-1').feature('API tests');
    });

    test('ID service should return 200 OK', async() => {
        const response = await requestId(generateFactoryID(1000, 9000), base64encode(environment.mockUrl))
        response.assertStatus(OK);
    });

    test('ID service should return 400 with proper Error for invalid factory ID', async() => {
        const responseA = await requestId('-1', base64encode(environment.mockUrl))
        const responseB = await requestId('20001', base64encode(environment.mockUrl))
        const responseC = await requestId('abc', base64encode(environment.mockUrl))

        const valueA = await responseA.parse();
        const valueB = await responseB.parse();
        const valueC = await responseC.parse();

        responseA.assertStatus(BAD_REQUEST);
        responseB.assertStatus(BAD_REQUEST);
        responseC.assertStatus(BAD_REQUEST);

        expect(valueA).toMatchSchema(ERROR);
        expect(valueB).toMatchSchema(ERROR);
        expect(valueC).toMatchSchema(ERROR);

        expect(valueA.error).toBe('Factory (nod) is not valid!');
        expect(valueB.error).toBe('Factory (nod) is not valid!');
        expect(valueC.error).toBe('Factory (nod) is not valid!');
    });

    test('ID service should return 200 OK', async() => {
        const response = await requestId('100', base64encode(environment.mockUrl))
        response.assertStatus(OK);
        const value = await response.parse();
        expect(value).toMatchSchema(ERROR);
        expect(value.error).toBe('Error: Bad request! x-test-session-id header is missing!');
    });

    test('ID service should return 400 with proper Error for invalid callback url', async() => {
        const responseA = await requestId(generateFactoryID(1000, 9000), hexEncode(environment.mockUrl))
        const responseB = await requestId(generateFactoryID(1000, 9000), 'http://lm')
        const responseC = await requestId(generateFactoryID(1000, 9000), base64encode('abc'))
        
        const valueA = await responseA.parse();
        const valueB = await responseB.parse();
        const valueC = await responseC.parse();

        responseA.assertStatus(BAD_REQUEST);
        responseB.assertStatus(BAD_REQUEST);
        responseC.assertStatus(BAD_REQUEST);

        expect(valueA).toMatchSchema(ERROR);
        expect(valueB).toMatchSchema(ERROR);
        expect(valueC).toMatchSchema(ERROR);

        expect(valueA.error).toBe('Callback URL is not valid base64 encoded URL!');
        expect(valueB.error).toBe('Callback URL is not valid base64 encoded URL!');
        expect(valueC.error).toBe('Callback URL is not valid base64 encoded URL!');
    });

    test('ID service should return 400 with proper Error for missing factory ID', async() => {
        const response = await requestId('', base64encode(environment.mockUrl))
        const value = await response.parse();
        response.assertStatus(BAD_REQUEST);
        expect(value).toMatchSchema(ERROR);
        expect(value.error).toBe('factoryId is not set!');
    });

    test('ID service should return 400 with proper Error for missing callback url', async() => {
        const response = await requestId(generateFactoryID(1000, 9000), '')
        const value = await response.parse();
        response.assertStatus(BAD_REQUEST);
        expect(value).toMatchSchema(ERROR);
        expect(value.error).toBe('callback is not set!');
    });

});
