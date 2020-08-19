import globals from './globals'
import runtime from './runtime'
import env from './env'

const environment = env();
export default environment;

export { globals, runtime, env }