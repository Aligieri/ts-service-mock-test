import { httpGet, prepareUrl, APIResponse, Empty } from './common'
import environment from '../../config';

export interface IdAppResponse {
    error?: string;
}

const getIdAppUrl = (path: string) => prepareUrl(path, environment.requestIdUrl)

export const requestId = async (factoryId: string | number, callback: string): Promise<APIResponse<IdAppResponse>> => {
    return await httpGet<IdAppResponse>(getIdAppUrl(`?factoryId=${factoryId}&callback=${callback}`));
};

export const requestIdwithoutFactoryId = async (callback: string): Promise<APIResponse<IdAppResponse>> => {
    return await httpGet<IdAppResponse>(getIdAppUrl(`?callback=${callback}`));
};

export const requestIdwithoutCallback = async (factoryId: string | number): Promise<APIResponse<IdAppResponse>> => {
    return await httpGet<IdAppResponse>(getIdAppUrl(`?factoryId=${factoryId}`));
};
