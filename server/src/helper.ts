import path from "path";
import ejs from "ejs";
import { fileURLToPath } from "url"; 
/**
 * Takes a ZodError and formats it into a plain object with the
 * error field as the key and the error message as the value.
 * 
 * @param error - The ZodError to be formatted
 * @returns A plain object with error field as the key and error message as the value
*/
export const formatError = (error:any):any => {
    let errors:any = {}
    error.errors?.map((issue:any) => {
        errors[issue.path?.[0]] = issue.message

    })
    return errors;
}

/**
 * Render an email template with EJS.
 * 
 * This function takes a filename of a template file, and some data to pass to the template.
 * It then uses EJS to render the template with the data.
 * 
 * The rendered HTML string is then returned.
 * Render a email template with ejs.
 * 
 * @param {string} filename The name of the template file to render, without the `.ejs` extension.
 * @param {Object} payload The data to pass to the template.
 * 
 * @returns {Promise<string>} The rendered HTML string.
 */
export const renderEmailEjs = async(filename:string,payload:any):Promise<string> => {
    // Get the current directory of this file
    const _dirname = path.dirname(fileURLToPath(import.meta.url));

    // Form the path to the template file
    const templatePath = _dirname + `/views/emails/${filename}.ejs`;

    // Render the template with the data
    const html:string = await ejs.renderFile(templatePath, payload);

    // Return the rendered HTML string
    return html;

}

/**
 * Recursively converts BigInt values within an object or array to strings.
 *
 * This is necessary because JSON.stringify does not handle BigInt values.
 *
 * @param {any} obj - The input object or array containing potential BigInt values.
 * @returns {any} A new object or array with all BigInt values converted to strings.
 */
export function serializeBigInt(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}