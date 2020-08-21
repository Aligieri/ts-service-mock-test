import { getAllRequestsForToken } from './api/factory';


export const checkForCallbacks = async (timeoutSec: number, token: string) => {
    let i = 0;
    while (i < timeoutSec) {
        const response = await (await getAllRequestsForToken(token)).parse();
        if (response.requests.length) {
            return response;
        }
        wait(timeoutSec * 1000);
        reporter.description('checking for callbacks');
        i++;
    }
    return { requests: [] };
}

function wait(ms: number) {
    const start = new Date().getTime();
    let end = start;
    while (end < start + ms) {
        end = new Date().getTime();
    }
}