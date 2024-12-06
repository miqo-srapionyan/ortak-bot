const fs = require('fs');
const path = require('path');

/**
 * FileHandler Class
 *
 * This class provides a reusable method for writing data to files while ensuring
 * the required directory structure exists. It abstracts file-writing logic, making it
 * easy to use in other classes through inheritance.
 */
class FileHandler {
    /**
     * Write data to a specified file.
     *
     * - Ensures that the directory for the file exists. If the directory does not exist,
     *   it will be created recursively.
     * - Converts the provided data to a JSON string and writes it to the specified file.
     *
     * @param {Object} data - The data to be written to the file. It will be serialized as JSON.
     * @param {string} filename - The full path to the file, including the directory and filename.
     * @param {string} [format='json'] - The format in which to write the data.
     *      - 'json' (default): Serializes the data to a JSON string.
     *      - 'text': Writes the data as raw text.
     *
     * Example:
     * const data = { key: 'value' };
     * const filename = './output/data.json';
     * writeToFile(data, filename);
     *
     * Expected Outcome:
     * - Creates the directory `./output/` if it does not exist.
     * - Writes the JSON-serialized `data` into `data.json`.
     */
    writeToFile(data, filename, format = 'json') {
        try {
            // Extract the directory path from the given filename
            const dir = path.dirname(filename);

            // Check if the directory exists
            if (!fs.existsSync(dir)) {
                // Create the directory recursively if it doesn't exist
                fs.mkdirSync(dir, { recursive: true });
                console.log(`Directory created: ${dir}`); // Log directory creation
            }

            if (format === 'json') {
                // Convert data to a pretty-printed JSON string and write to the file
                fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf-8');
            } else {
                fs.writeFileSync(filename, data, 'utf-8');
            }

            console.log(`Result written to file: ${filename}`); // Log successful write operation
        } catch (error) {
            // Handle any errors that occur during the file or directory operation
            console.error('Error writing to file:', error);
        }
    }

    /**
     * Reads and parses a JSON file.
     *
     * This method checks if the specified file exists, reads its content if it does,
     * and attempts to parse the content as a JSON object. If the file does not exist,
     * it returns `null`.
     *
     * @param {string} filename - The path to the file to be read.
     *   - The file should contain valid JSON content if it is to be parsed.
     *
     * @returns {Object|null} - The parsed JSON object from the file, or `null` if the file
     *   does not exist or is unreadable.
     *
     * Example:
     * ```javascript
     * const data = readFile('./output/data.json');
     * console.log(data); // Outputs the parsed content of the JSON file if it exists.
     * ```
     *
     * Notes:
     * - If the file does not exist, this method returns `null` and does not throw an error.
     * - The file content is expected to be in JSON format. If the content is not valid JSON,
     *   an error will be thrown by `JSON.parse`.
     */
    readFile(filename) {
        if (fs.existsSync(filename)) {
            const fileData = fs.readFileSync(filename, 'utf-8');

            return JSON.parse(fileData);
        }

        return null;
    }
}

module.exports = FileHandler;
