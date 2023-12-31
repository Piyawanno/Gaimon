class Hmac {
    constructor(hash, password, verify) {
        if (!hash.HASH_SIZE)
            throw new SyntaxError("option 'hash' supplied doesn't seem to be a valid hash function");
        this.hash = hash;
        this.BLOCK_SIZE = this.hash.BLOCK_SIZE;
        this.HMAC_SIZE = this.hash.HASH_SIZE;
        this.result = null;
        this.key = _hmac_key(this.hash, password);
        const ipad = new Uint8Array(this.key);
        for (let i = 0; i < ipad.length; ++i)
            ipad[i] ^= 0x36;
        this.hash.reset().process(ipad);
        if (verify !== undefined) {
            this._hmac_init_verify(verify);
        }
        else {
            this.verify = null;
        }
    }
    process(data) {
        if (this.result !== null)
            throw new IllegalStateError('state must be reset before processing new data');
        this.hash.process(data);
        return this;
    }
    finish() {
        if (this.result !== null)
            throw new IllegalStateError('state must be reset before processing new data');
        const inner_result = this.hash.finish().result;
        const opad = new Uint8Array(this.key);
        for (let i = 0; i < opad.length; ++i)
            opad[i] ^= 0x5c;
        const verify = this.verify;
        const result = this.hash
            .reset()
            .process(opad)
            .process(inner_result)
            .finish().result;
        if (verify) {
            if (verify.length === result.length) {
                let diff = 0;
                for (let i = 0; i < verify.length; i++) {
                    diff |= verify[i] ^ result[i];
                }
                if (diff !== 0)
                    throw new Error("HMAC verification failed, hash value doesn't match");
            }
            else {
                throw new Error("HMAC verification failed, lengths doesn't match");
            }
        }
        this.result = result;
        return this;
    }
    _hmac_init_verify(verify) {
        if (verify.length !== this.HMAC_SIZE)
            throw new IllegalArgumentError('illegal verification tag size');
        this.verify = verify;
    }
}

function _hmac_key(hash, password) {
    const key = new Uint8Array(hash.BLOCK_SIZE);
    if (password.length > hash.BLOCK_SIZE) {
        key.set(hash
            .reset()
            .process(password)
            .finish().result);
    }
    else {
        key.set(password);
    }
    return key;
}
