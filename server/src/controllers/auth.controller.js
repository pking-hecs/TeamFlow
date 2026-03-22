import bcrypt from "bcrypt"
import { insertUser, findUser } from "../models/user.model.js";
import jwt from "jsonwebtoken"
const SECRET_KEY = "my-server-key";

const signup = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
            res.status(400).json({error: errors.array()});
    }
    const {username, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await insertUser(username, hashedPassword);
    res.redirect('/login');
}

const login = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
            res.status(400).json({error: errors.array()});
    }
    const {username, password} = req.body;
    const user = await findUser(username);
    if(!user){
        res.json({message: "Invalid User"});
    }
    const match = await bcrypt.compare(password, user.password);
    if(!match){
        res.json({message: "Invalid password"});
    }
    const token = jwt.sign({username: user.username}, SECRET_KEY, {
        expiresIn: '7h'
    });
    res.json(token);
}

export {signup, login};