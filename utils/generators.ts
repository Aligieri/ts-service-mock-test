export const generateFactoryID = (min: number, max: number) : string => {
    return Math.floor(min + (Math.random() * (max - min))).toString();
};