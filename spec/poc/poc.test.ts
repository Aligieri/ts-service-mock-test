import { requestId } from '../../utils/api/id';
import { allureReporter } from '../../utils/report';
import { base64encode } from '../../utils/string';
import environment from '../../config';
import {OK, CREATED, NOT_FOUND, BAD_REQUEST} from 'http-status'
import { ERROR } from '../../utils/schema';


describe('ID service tests', () => {
    beforeEach(() => {
        allureReporter().epic('FRP-1').feature('API tests');
    });

    test('should work', async() => {
        const response = await requestId('100', base64encode(environment.mockUrl))
        response.assertStatus(OK);
        const value = await response.parse();
        expect(value).toMatchSchema(ERROR);
        expect(value.error).toBe('Error: Bad request! x-test-session-id header is missing!');
    });
});
