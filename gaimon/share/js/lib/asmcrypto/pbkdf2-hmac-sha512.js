function Pbkdf2HmacSha512(password, salt, count, length) {
    const hmac = new HmacSha512(password);
    return pbkdf2core(hmac, salt, length, count);
}
