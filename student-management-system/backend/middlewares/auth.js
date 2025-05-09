require('dotenv').config();
const jwt = require('jsonwebtoken');


const auth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header', authHeader);
    if(!authHeader){
        return res.status(401).json({message:"No token provided"})
    }

    const token = authHeader.startsWith('Bearer')? authHeader.split(' ')[1]:authHeader;
    console.log('Extracted token', token);

    if(!token){
        return res.status(401).json({message: "Invalid token format!"});
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('JWT Verification Error', err.message);
            return res.status(401).json({message:"Invalid token!"});
        }

        req.user = decoded;
        next();
    });
};

const authorizeRole = (role) => (req, res, next) => {
    if(req.user.role !== role){
        return res.status(403).json({message: "Forbiddden!"});
    }
    next();
};


module.exports = { auth, authorizeRole}