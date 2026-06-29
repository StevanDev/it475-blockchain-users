const crypto = require('crypto');

class Block {
    constructor(index, timestamp, action, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.action = action;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return crypto
            .createHash('sha256')
            .update(
                this.index +
                this.timestamp +
                this.action +
                this.data +
                this.previousHash
            )
            .digest('hex');
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock() {
        return new Block(0, Date.now(), 'GENESIS', 'genesis_data', '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addAction(action, data) {
        const latestBlock = this.getLatestBlock();
        const newBlock = new Block(
            this.chain.length,
            Date.now(),
            action,
            data,
            latestBlock.hash
        );
        this.chain.push(newBlock);
        return newBlock;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

module.exports = Blockchain;
