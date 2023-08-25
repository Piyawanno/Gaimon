class IllegalStateError extends Error {
    constructor(...args) {
        super(...args);
        Object.create(Error.prototype, { name: { value: 'IllegalStateError' } });
    }
}
class IllegalArgumentError extends Error {
    constructor(...args) {
        super(...args);
        Object.create(Error.prototype, { name: { value: 'IllegalArgumentError' } });
    }
}
class SecurityError extends Error {
    constructor(...args) {
        super(...args);
        Object.create(Error.prototype, { name: { value: 'SecurityError' } });
    }
}
