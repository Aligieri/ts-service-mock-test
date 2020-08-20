export const base64encode = (s: string) : string => {
    return Buffer.from(s).toString('base64');
};

export const hexEncode = (s: string) : string => {
    return Buffer.from(s).toString('hex');
};