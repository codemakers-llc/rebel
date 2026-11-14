// Registro explícito; el CLI puede insertar importaciones aquí.
const factories=new Map();
export function registerComponent(name,factory){if(!/^[a-z][a-zA-Z0-9]*$/.test(name)||typeof factory!=='function'||factories.has(name))throw Error('COMPONENT_INVALID_OR_DUPLICATE');factories.set(name,factory)}
export function resolveComponent(name){const component=factories.get(name);if(!component)throw Error('COMPONENT_NOT_REGISTERED: '+name);return component}
export function listComponents(){return [...factories.keys()]}
