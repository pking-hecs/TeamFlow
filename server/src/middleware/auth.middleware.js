
const authenticateToken = (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        res.status(401).json({message: "Token missing"});
    }
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if(err){
            res.status(403).json({message: "Invalid or expired Token"});
        }
        next();
    })
}

export default authenticateToken;