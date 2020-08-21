import { httpGet, prepareUrl, APIResponse, Empty } from './common'
import { env } from '../../config';


export interface IdAppResponse {
    error?: string;
}


const environment = env();
const getIdAppUrl = (path: string) => prepareUrl(path, environment.idServiceUrl)


export const requestId = async (factoryId: string, callback: string): Promise<APIResponse<IdAppResponse>> => {
    return await httpGet<IdAppResponse>(getIdAppUrl(`ID?factoryId=${factoryId}&callback=${callback}`));
};

export const requestIdwithoutFactoryId = async (callback: string): Promise<APIResponse<IdAppResponse>> => {
    return await httpGet<IdAppResponse>(getIdAppUrl(`ID?callback=${callback}`));
};

export const requestIdwithoutCallback = async (factoryId: string): Promise<APIResponse<IdAppResponse>> => {
    return await httpGet<IdAppResponse>(getIdAppUrl(`ID?factoryId=${factoryId}`));
};
