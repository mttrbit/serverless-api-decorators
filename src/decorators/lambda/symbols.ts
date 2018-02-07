/**
 * References the service description of an endpoint
 *
 * ### Example
 * ```js
 * const service = serviceInstances[name];
 * const serviceDescription = service[ENDPOINT_SYMBOL];
 * const endpoints = service[LAMBDA_SYMBOL];
 * ```
 */
export const ENDPOINT_SYMBOL = '__service__';
/**
 * References a lambda function
 */
export const LAMBDA_SYMBOL = '__endpoints__';
