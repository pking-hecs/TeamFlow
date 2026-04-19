import bcrypt from "bcrypt"
import { insertUser, findUser } from "../models/user.model.js";
import jwt from "jsonwebtoken"
import { validationResult } from "express-validator";

const SECRET_KEY = "my-server-key";

const signup = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({error: errors.array()});
    }
    const {username, email, password} = req.body;
    const existingUser = await findUser(email);
    if(existingUser) {
        return res.status(409).json({message: "Email already exists"});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await insertUser(username, email, hashedPassword);
    res.status(201).json({message: "User created successfully"});
}

const login = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({error: errors.array()});
    }
    const {email, password} = req.body;
    const user = await findUser(email);
    if(!user){
        return res.status(401).json({message: "Invalid User"});
    }
    const match = await bcrypt.compare(password, user.password);
    if(!match){
        return res.status(401).json({message: "Invalid password"});
    }
    const token = jwt.sign({id: user.id, username: user.username, email: user.email}, SECRET_KEY, {
        expiresIn: '7h'
    });
    res.json({token});
}

export {signup, login};