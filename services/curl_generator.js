const { output: { buyNftCurl } } = require('../config')
const FileHandler = require('./file_handler');

/**
 * CurlGenerator Class
 *
 * This class provides functionality to generate a `curl` command string based on
 * a given payload, URL, and authentication token. It also includes a method to
 * save the generated `curl` command to a file using the inherited `FileHandler`
 * class functionality.
 *
 * Methods:
 * - generateCurl(payload, url, token): Generates a `curl` command string for making a
 *   request to the provided URL with the given payload and authentication token.
 * - run(payload, url, token): Calls `generateCurl` to generate the `curl` command,
 *   and writes the result to a file using the `writeToFile` method inherited from the
 *   `FileHandler` class.
 */
class CurlGenerator extends FileHandler {
    /**
     * Generates a `curl` command string for the provided URL, payload, and token.
     *
     * This method assembles the required headers, authentication token, and the
     * request payload to create a `curl` command string that can be used in
     * command-line environments for API requests.
     *
     * @param {Object} payload - The data to be sent in the request body, typically
     *                            serialized as JSON.
     * @param {string} url - The target URL for the API request.
     * @param {string} token - The authentication token to be sent in the request header.
     * @returns {string} - The constructed `curl` command string.
     *
     * Example:
     * const payload = { key: 'value' };
     * const url = 'https://api.example.com/data';
     * const token = 'your-auth-token';
     * const curlCommand = CurlGenerator.generateCurl(payload, url, token);
     */
    static generateCurl(payload, url, token) {
        return `curl '${url}' \\
  -H 'accept: */*' \\
  -H 'accept-language: ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7' \\
  -H 'cache-control: no-cache' \\
  -H 'content-type: text/plain;charset=UTF-8' \\
  -H 'origin: https://ortak.me' \\
  -H 'pragma: no-cache' \\
  -H 'priority: u=1, i' \\
  -H 'referer: https://ortak.me/en/collections/nhl/nfts' \\
  -H 'sec-ch-ua: "Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"' \\
  -H 'sec-ch-ua-mobile: ?0' \\
  -H 'sec-ch-ua-platform: "Windows"' \\
  -H 'sec-fetch-dest: empty' \\
  -H 'sec-fetch-mode: cors' \\
  -H 'sec-fetch-site: same-origin' \\
  -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' \\
  -H 'x-auth-token: ${token}' \\
  --data-raw '${JSON.stringify(payload)}'`;
    }

    /**
     * Generates the `curl` command and writes it to a file.
     *
     * This method calls `generateCurl` to create the `curl` command string, then
     * writes the result to a specified file using the `writeToFile` method inherited
     * from the `FileHandler` class. The file is saved as a text file.
     *
     * @param {Object} payload - The data to be sent in the request body.
     * @param {string} url - The target URL for the API request.
     * @param {string} token - The authentication token for the request header.
     */
    static run(payload, url, token) {
        const curlCommand = this.generateCurl(payload, url, token);

        (new CurlGenerator()).writeToFile(curlCommand, buyNftCurl, 'text');
    }
}

module.exports = CurlGenerator;
