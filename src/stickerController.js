import tinySVG from 'tinysvg-js';
import controller from 'infinitymint-client/dist/src/classic/controller';
import { call, md5 } from './helpers';
import storageController from 'infinitymint-client/dist/src/classic/storageController';
/**
 * Web3 Sticker Controller Class
 *      Llydia Cross 2022
 *
 * Like the Web3 Controller class but only for stickers
 */

export const parseBlockchainSticker = async (value, tokenId) => {
    let Config = controller.getConfig();
    const unpacked = controller.decodeRequest(value, true, false);
    unpacked.request = controller.decodeSticker(unpacked.request, false, false);

    if (unpacked.request.sticker.includes('{')) {
        unpacked.request.sticker = JSON.parse(unpacked.request.sticker);
    } else if (
        unpacked.request.sticker.startsWith('https://') ||
        unpacked.request.sticker.startsWith('http://') ||
        unpacked.request.sticker.startsWith('data:image/svg+xml;base64,')
    ) {
        const result = await fetch(unpacked.request.sticker);
        unpacked.request.sticker = await result.json();
    } else {
        const result = await fetch(
            'https://ipfs.io/ipfs/' + unpacked.request.sticker + '/index.json'
        );
        unpacked.request.sticker = await result.json();
    }

    unpacked.verified = false;
    if (stickerController.verifyStickerChecksum(unpacked.request.sticker)) {
        unpacked.verified = true;
    }

    if (unpacked.verified) {
        // TODO: Make it so they can be images as well
        try {
            if (storageController.values.requests[tokenId] === undefined) {
                storageController.values.requests[tokenId] = {};
            }

            storageController.values.requests[tokenId][
                unpacked.request.sticker.id
            ] = {
                id: unpacked.request.sticker.id,
                time: Date.now(),
                source: 'result',
                sticker:
                    storageController.values.stickers[
                        unpacked.request.sticker.id
                    ] !== undefined
                        ? unpacked.request.sticker.id
                        : unpacked.request.sticker,
                verified: unpacked.verified,
                validTill: Date.now() + Config.settings.cacheLength,
            };

            storageController.saveData();
        } catch (error) {
            controller.log('[😞] Error', 'error');
            controller.log(error);
        }
    } else {
        controller.log(
            '[😞] WARNING! Could not verify sticker potentially very bads sticker! Please look into this sticker:',
            'error'
        );
        console.log(unpacked);
    }

    return { ...unpacked };
};

export class StickerController {
    instance;
    token;
    tokenId;
    contractName;

    async isDifferentTokenId(comparable) {
        return this.tokenId !== comparable;
    }

    /**
     *
     * @param {number} tokenId
     * @returns
     * @throws
     */
    async createContract(tokenId, contractName = 'Fake_EADStickers') {
        let Config = controller.getConfig();
        const abi = Config.getDeployment(contractName).abi;
        this.token = await controller.getTokenObject(tokenId);
        this.tokenId = tokenId;

        if (
            this.token.destinations[1] === undefined ||
            this.token.destinations[1] === controller.nullAddress
        ) {
            throw new Error('user has not linked sticker contract');
        }

        this.contractName = contractName;
        this.instance = controller.initializeContract(
            this.token.destinations[1],
            contractName,
            true,
            abi
        );
        controller.setupEvents(contractName);
        return this.instance;
    }

    /**
     * Supply a string instead of an object to look up an Id locally
     * @param {string|Object} sticker
     * @returns
     */
    verifyStickerChecksum(sticker) {
        if (typeof sticker === 'string') {
            sticker = this.getLocalSticker(sticker);
        }

        if (sticker.final !== undefined) {
            sticker = sticker.final;
        }

        if (
            sticker?.checksum === undefined ||
            typeof sticker.checksum !== 'string'
        ) {
            return false;
        }

        const copy = { ...sticker };
        if (copy.checksum !== undefined) {
            delete copy.checksum;
        }

        if (copy.convertedPath !== undefined) {
            delete copy.convertedPath;
        }

        if (sticker.checksum !== md5(JSON.stringify(copy))) {
            return false;
        }

        return true;
    }

    /**
     * When passing a string, will look up the id in storage controller, use second argument to specify of final if normal sticker.
     * If passing object, second parameter is obsolete. Third parameter set to true will throw on all errors instead of silent return, it
     * silent returns on name check and sticker Id undefined in storage controller check.
     * @param {object|string} potentialSticker
     * @param {bool} final
     * @param {bool} throwAll
     * @returns
     */

    checkSticker(potentialSticker, final = false, throwAll = false) {
        let sticker;
        let Config = controller.getConfig();

        if (
            typeof potentialSticker !== 'object' &&
            typeof potentialSticker !== 'string'
        ) {
            throw new TypeError('bad sticker');
        }

        if (
            typeof potentialSticker === 'object' &&
            potentialSticker.name !== undefined
        ) {
            sticker = { ...potentialSticker };
            final = false;
        } else if (
            storageController.values.stickers[potentialSticker] === undefined
        ) {
            if (throwAll) {
                throw new Error('bad sticker');
            } else {
                return;
            }
        } else {
            sticker = storageController.values.stickers[potentialSticker];
            if (final && sticker.final === undefined) {
                throw new Error('bad sticker');
            }

            if (final) {
                sticker = sticker.final;
            }
        }

        if (sticker.name === undefined && throwAll) {
            throw new Error('Invalid Metadata');
        } else if (sticker.name === undefined) {
            return;
        }

        if (sticker.paths === undefined || sticker.paths === '') {
            throw new Error('Invalid/Unset Apperance');
        }

        if (sticker.properties === undefined) {
            throw new Error('Invalid Properties: No properties present');
        }

        if (
            sticker.properties.x === undefined ||
            sticker.properties.y === undefined ||
            sticker.properties.scale === undefined
        ) {
            throw new Error(
                'Invalid Properties: Scale, X or Y property missing.'
            );
        }

        if (sticker.properties.scale < 0 || sticker.properties.scale > 1) {
            throw new Error('Invalid Properties: Scale is invalid');
        }

        if (
            (final && sticker.state === 0) ||
            (final && sticker.checksum === undefined)
        ) {
            throw new Error('bad sticker');
        }

        const pathSize = new Blob([JSON.stringify(sticker.paths)]).size;
        const totalSize = new Blob([JSON.stringify(sticker)]).size;

        if (pathSize > Config.settings.maxPathSize) {
            throw new Error(
                'Invalid Paths: The size of the SVG is currently too big.'
            );
        }

        if (totalSize > Config.settings.maxStickerSize) {
            throw new Error(
                'Invalid Sticker: The size of the sticker is currently too big.'
            );
        }
    }

    getLocalSticker(localStickerId) {
        return storageController.values.stickers[localStickerId];
    }

    finalizeSticker(localStickerId) {
        storageController.values.stickers[localStickerId].state = 1;
        storageController.values.stickers[localStickerId].final = {
            ...storageController.values.stickers[localStickerId],
        };

        // Delete the final final
        delete storageController.values.stickers[localStickerId].final.final;

        // Generate MD5 hash of the final struct
        storageController.values.stickers[localStickerId].final.checksum = md5(
            JSON.stringify(
                storageController.values.stickers[localStickerId].final
            )
        );

        storageController.saveData();

        return storageController.values.stickers[localStickerId].final;
    }

    async sendRequest(localStickerId, stickerPrice = null) {
        let Config = controller.getConfig();
        this.checkSticker(localStickerId, true, true); // Will throw

        if (!this.verifyStickerChecksum(localStickerId)) {
            throw new Error('Checksum Invalid');
        }

        if (stickerPrice === null) {
            stickerPrice = await this.getStickerPrice();
        }

        const sticker = storageController.values.stickers[localStickerId].final;
        const result = await controller.sendAndWaitForEvent(
            controller.accounts[0],
            this.contractName,
            'addRequest',
            Config.events.Stickers.RequestAdded,
            {
                parameters: [this.encodeStickerRequest(sticker)],
                gasPrice: Config.getGasPrices().fast,
            },
            stickerPrice
        );

        if (result[0] !== null) {
            throw new Error(result[0]?.message || JSON.stringify(result[0]));
        }

        if (storageController.values.requests[this.tokenId] === undefined) {
            storageController.values.requests[this.tokenId] = {};
        }

        storageController.values.requests[this.tokenId][localStickerId] = {
            id: localStickerId,
            time: Date.now(),
            source: 'local',
            sticker: localStickerId,
            validTill: Date.now() + Config.settings.cacheLength,
            verified: false,
        };

        if (
            storageController.values.stickers[localStickerId].requests ===
            undefined
        ) {
            storageController.values.stickers[localStickerId].requests = [
                this.tokenId,
            ];
        }

        storageController.saveData();
        return result[1];
    }

    encodeStickerRequest(sticker) {
        return controller.web3.eth.abi.encodeParameters(
            ['uint64', 'string', 'string', 'address'],
            [
                this.tokenId,
                sticker.checksum,
                sticker.cid,
                controller.accounts[0],
            ]
        );
    }

    async acceptRequest(address, index) {
        let Config = controller.getConfig();
        const result = await controller.sendAndWaitForEvent(
            controller.accounts[0],
            this.contractName,
            'acceptRequest',
            Config.events.Stickers.RequestAccepted,
            {
                parameters: [address, index],
                gasPrice: Config.getGasPrices().fast,
            }
        );

        controller.toggleFlag(this.tokenId, 'refresh');
        controller.toggleFlag(this.tokenId, 'needsTokenURIREfresh');

        return result;
    }

    async withdrawRequest(index) {
        let Config = controller.getConfig();
        return await controller.sendAndWaitForEvent(
            controller.accounts[0],
            this.contractName,
            'withdrawRequest',
            Config.events.Stickers.RequestWithdrew,
            {
                parameters: [index],
                gasPrice: Config.getGasPrices().fast,
            }
        );
    }

    hasRequestsForSticker(id) {
        const requests = Object.values(storageController.values.requests || []);
        if (requests.length === 0) {
            return false;
        }

        for (const request_ of requests) {
            const request = Object.values(request_);

            for (const sticker of request) {
                if (sticker.id === id) {
                    return true;
                }
            }
        }
    }

    async denyRequest(address, index) {
        let Config = controller.getConfig();
        return await controller.sendAndWaitForEvent(
            controller.accounts[0],
            this.contractName,
            'denyRequest',
            Config.events.Stickers.RequestDenied,
            {
                parameters: [address, index],
                gasPrice: Config.getGasPrices().fast,
            }
        );
    }

    async setStickerPrice(price) {}

    async getBlockchainSticker(stickerId) {}

    async getStickerObject(stickerId) {}

    async getStorageSticker(stickerId) {}

    async getStickerPrice() {
        if (this.instance === undefined) {
            throw new Error(
                'You have not called createContract inside of this class'
            );
        }

        return controller.callMethod(
            controller.accounts[0],
            this.contractName,
            'stickerPrice'
        );
    }

    /**
     *
     * @param {*} id
     * @param {*} method
     * @returns
     */
    async getSticker(id, method = 'getMyRequestedSticker') {
        const result = await controller.callMethod(
            controller.accounts[0],
            this.contractName,
            method,
            { parameters: [id] }
        );

        return parseBlockchainSticker(result, this.tokenId);
    }

    /**
     *
     * @returns
     */
    async getRequests() {
        return await this.getRequestedStickersMethod(
            this.tokenId,
            'getRequests'
        );
    }

    async getMyRequestedStickers() {
        return await this.getRequestedStickersMethod(
            this.tokenId,
            'getMyRequests'
        );
    }

    /**
     *
     * @returns
     */
    async getRequestedStickersMethod(tokenId, method = 'getMyRequests') {
        let results = [];

        try {
            results = await call(this.contractName, method);
            console.log(results);
        } catch (error) {
            controller.log(error);
        }

        if (results.length === 0) {
            controller.log('[⚠️] Has no requested stickers', 'warning');
            return [];
        }

        const returns = [];
        for (const [i, result] of results.entries()) {
            if (result === '0x') {
                controller.log(
                    new Error(
                        'index ' +
                            i +
                            ' is zero bytes potentially faulty sticker contract'
                    )
                );
                continue;
            }

            returns[i] = await parseBlockchainSticker(result, tokenId);
        }

        return returns;
    }

    /**
     * Must call await controller.createStickerContract(tokenId) before
     * @param {number} tokenId
     * @returns
     */
    async getStickers() {
        if (this.instance === undefined) {
            throw new Error(
                'You have not called createContract inside of this class'
            );
        }

        const results = await controller.callMethod(
            controller.accounts[0],
            this.contractName,
            'getStickers',
            {}
        );

        if (results.length === 0) {
            return [];
        }

        const returns = [];
        for (const result_ of results) {
            const result = await this.getSticker(result_, 'getSticker');
            returns.push(result);
        }

        return returns;
    }
}

const stickerController = new StickerController();
export default stickerController;
