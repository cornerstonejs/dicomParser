export const underflowErrorMessage = 'Attempted to read before buffer start';
export const overflowErrorMessage = 'Attempted to read past buffer end';

/**
 *
 * @param {string} param the name of the missing parameter
 * @returns {`Missing required parameter '${string}'`}
 */
export const missingParameter = (param) => `Missing required parameter '${param}'`;

/**
 *
 * @param {string} param the name of the invalid parameter
 * @param {string} explanation why the parameter is invalid and, what conditions should the parameter's value meet to
 * be valid and if possible the received value.
 * @returns {`Invalid parameter '${string}': ${string}`}
 */
export const invalidParameter = (param, explanation) => `Invalid parameter '${param}': ${explanation}`;

/**
 * Encapsulate errors thrown during a parsing operation.
 *
 * @property {DataSet} dataSet the dataset the error relates to, might be only partially constructed
 * depending on where the error occurred.
 * @property {Error} cause the original parsing error
 */
export class DicomParserError extends Error {
  constructor (dataSet, cause) {
    super('Failed to parse dataSet.', { cause });
    this.dataSet = dataSet;
  }
}
