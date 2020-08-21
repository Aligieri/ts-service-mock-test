import { IncomingHttpHeaders } from 'http';
import { httpGet, prepareUrl, httpDelete, httpPost, httpPut } from './common'
import environment from '../../config';

const baseUrl = environment.mockUrl;
const getFactoryUrl = (path: string) => prepareUrl(path, environment.mockUrl);

export interface FactoryResponse {
    error?: string;
}

export interface LaptopRequestBody {
    factoryId: number;
    baseUrl: string;
}

export interface Laptop extends FactoryResponse {
    token: string;
    factoryId: number;
    created: number;
    callbackUrl?: string;
    callbackUrlBase64?: string;
}

export interface ReceiveException {
    token: string;
}

export interface TimeoutException extends ReceiveException {
    kind: 'timeout';
    after: number;
    times: number;
}

export type TimeoutExceptionRequestBody = Pick<TimeoutException, 'after' | 'times'>;

export interface FailException extends ReceiveException {
    kind: 'fail';
    status: number;
    message?: string;
}

export type FailExceptionRequestBody = Pick<FailException, 'status'>;

export type CallbackResponseStatus = 'timeout' | 'fail' | 'success';

export interface CallbackRequest {
    token: string;
    headers: IncomingHttpHeaders;
    body: any;
    received: number;
    status: number;
    response: CallbackResponseStatus;
}

export interface CallbackRequests {
    requests: CallbackRequest[];
}

export interface DB {
    sessionId: string;
    baseUrl: string;
    laptops: Laptop[];
    exceptions: (TimeoutException | FailException)[];
    requests: CallbackRequest[];
}

export const makeNewLaptop = async (factoryId: number) => {
    return await httpPut<LaptopRequestBody, Laptop>(getFactoryUrl('_make'), { factoryId, baseUrl });
};

export const setLaptopStatusAsTimeout = async (token: string, after: number, times: number) => {
    return await httpPost<TimeoutExceptionRequestBody, TimeoutException>(getFactoryUrl(`_timeout/${token}`), { after, times });
};

export const setLaptopStatusAsFail = async (token: string, status: number) => {
    return await httpPost<FailExceptionRequestBody, FailException>(getFactoryUrl(`_fail/${token}`), { status });
};

export const getAllRequestsForToken = async (token: string) => {
    return await httpGet<CallbackRequests>(getFactoryUrl(`_requests/${token}`));
};

export const deleteDatabase = async () => {
    return await httpDelete(getFactoryUrl(`_data`));
};

export const getDatabase = async () => {
    return await httpGet<DB>(getFactoryUrl(`_data`));
};