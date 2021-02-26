var crypto = require('crypto')

const AUTH_TOKEN = "MyVeryStrongPassword@1855";
// console.log(decrypt('36A20092A106DE481FCB2A8D55C7FFF2655D99EE258C71788449B505151C2CE4'))

function decrypt(encrypted) {
    const passcode = "3zTvzr3p67VC61jm";
    const iv = "60iP0h6vJoEaythj";
    var decipher = crypto.createDecipheriv('aes-128-cbc', passcode, iv);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8')
    return decrypted;
}

function authorize(token) {
    const authToken = token.split(' ')[1];
    var decrypted = '';
    try {
        decrypted = decrypt(authToken)
    } catch (err) {
        console.log('Bad input params')
    }
    if (decrypted != AUTH_TOKEN) {
        return false;
    }
    return true;
}

module.exports = authorize;