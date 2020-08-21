// import { SerialRequest, DB, Factory, SerialRequestStatus } from '../types'
import { httpGet, prepareUrl, APIResponse, Empty, httpDelete, httpPost, httpPut, makeRequest } from './common'
import environment from '../../config';
import fetch from 'node-fetch';
import { Status } from 'jest-allure/dist/Reporter';

export interface factoryResponse {
    callbackUrlBase64?: string;
    error?: string;
}

const baseUrl = environment.mockUrl;
const getFactoryUrl = (path: string) => prepareUrl(path, environment.mockUrl);

export const makeNewLaptop = async(factoryId: number) => {
    return await httpPut(getFactoryUrl('_make'), {'factoryId': factoryId, 'baseUrl': baseUrl});
};

export const setLaptopStatusAsTimeout = async (token: string, after: number, times: number) => {
    return await httpPost(getFactoryUrl(`_timeout/${token}`), {'after': after, 'times': times});
};

export const setLaptopStatusAsFail = async (token: string, status: number) => {
    return await httpPost(getFactoryUrl(`_fail/${token}`), {'status': status});
};

export const getAllRequestsForToken = async (token: string) => {
    return await httpGet(getFactoryUrl(`_requests/${token}`));
};

export const deleteDatabase = async () => {
    reporter.description('Cleaning database ...')
    return await httpDelete(getFactoryUrl(`_data`));
};

export const getDatabase = async () => {
    return await httpGet(getFactoryUrl(`_data`));
};

export const getStatus = async () => {
    return await httpGet(getFactoryUrl(`status`));
};