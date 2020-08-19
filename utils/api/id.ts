// import { SerialRequest, DB, Factory, SerialRequestStatus } from '../types'
import { httpGet, prepareUrl, APIResponse, Empty } from './common'
import { env } from '../../config';

// TODO: use these as examples to implement client methods

export interface IdAppResponse {
    error?: string;
}

const environment = env();
const getUrl = (path: string) => prepareUrl(path, environment.idServiceUrl)

export const requestId = async (factoryId: string, callback: string): Promise<APIResponse<IdAppResponse>> => {
    return await httpGet<IdAppResponse>(getUrl(`/?factoryId=${factoryId}&callback=${callback}`));
};