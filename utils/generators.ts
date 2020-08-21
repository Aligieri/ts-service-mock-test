export const generateFactoryID = (min: number, max: number) : number => {
    return Math.floor(min + (Math.random() * (max - min)));
};