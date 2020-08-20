// TODO: implement here the schema for the responses to validate
// See https://json-schema.org/
export const ERROR = {
    $id: 'error',
    type: 'object',
    properties: {
        error: {
            type: 'string'
        }
    },
    required: ['error']
};

export const OK = {
    $id: 'ok',
    type: 'object',
    properties: {
        id: {
            type: 'string'
        }
    },
    required: ['id']
};