const { output: { buyNftPayload } } = require('./config')
const CurlGenerator = require('./services/curl_generator');
const FileHandler = require('./services/file_handler');

class OrtakNFTFetcher extends FileHandler {
    constructor() {
        super();
        this.ORTAK_BASE_URL = process.env.ORTAK_BASE_URL;
        this.BUY_NFT_PAYLOAD = buyNftPayload;
        this.nftUrl = `${this.ORTAK_BASE_URL}/panel/collections/nfts`;
    }

    async fetchNFTs(collectionId, page = 10) {
        try {
            const payload = {
                page,
                collectionId,
                partnerId: 0,
            };

            const response = await fetch(this.nftUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }

            const responseData = await response.json();
            if (responseData.code !== 0) {
                throw new Error(`Unexpected response code: ${responseData.code}`);
            }

            return responseData.data.items;
        } catch (error) {
            console.error('Error fetching NFTs:', error);

            return [];
        }
    }

    processNFTs(nfts) {
        const result = {
            total: 0,
            nfts: [],
            nftsPrices: {},
            partnerId: 0,
        };

        nfts.forEach((nft) => {
            result.total += nft.price; // Accumulate total price
            result.nfts.push(nft.id); // Add NFT id
            result.nftsPrices[nft.id] = nft.price; // Map id to price
        });

        result.total = parseFloat(result.total.toFixed(10)); // Round total to 3 decimal places

        return result;
    }

    async run(collectionId, page = 10, token) {
        if (!collectionId) {
            console.error('Error: collectionId is required.');

            return;
        }

        console.log(`Fetching NFTs for collectionId: ${collectionId}`);
        const nfts = await this.fetchNFTs(collectionId, page);

        if (nfts.length === 0) {
            console.log('No NFTs found for the given collection.');

            return;
        }

        const processedPayload = this.processNFTs(nfts);
        this.writeToFile(processedPayload, this.BUY_NFT_PAYLOAD); // Write result to file

        CurlGenerator.run(processedPayload, this.nftUrl, token);

        return processedPayload;
    }
}

// Example usage:
// Define your collection ID and optionally the page number
const collectionId = parseInt(process.argv[2], 10); // Pass as CLI argument
const page = process.argv[3] ? parseInt(process.argv[3], 10) : 10; // Default to page 10
const token = process.argv[4];

const fetcher = new OrtakNFTFetcher(); // Initialize with the base URL
fetcher.run(collectionId, page, token).catch(console.error);
