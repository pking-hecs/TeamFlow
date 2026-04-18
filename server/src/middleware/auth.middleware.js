import jwt from "jsonwebtoken";

const SECRET_KEY = "my-server-key";

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        return res.status(401).json({message: "Token missing"});
    }
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if(err){
            return res.status(403).json({message: "Invalid or expired Token"});
        }
        req.user = decoded;
        next();
    })
}

export default authenticateToken;