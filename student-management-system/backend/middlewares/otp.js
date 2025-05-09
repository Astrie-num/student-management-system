const crypto = require('crypto');

class OTP {
    static generate(){
        return crypto.randomInt(100000, 999999).toString();
    }

    static verify(otp, storedOtp){
        return otp === storedOtp;
    }
}

module.exports = OTP;