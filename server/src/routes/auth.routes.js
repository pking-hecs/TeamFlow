import {Router} from "express"
import {body, validationResult} from "express-validator"
import {signup, login} from "../controllers/auth.controller.js"
import authenticateToken from "../middleware/auth.middleware.js"

const validate = [
    body("username")
    .trim()
    .notEmpty().withMessage("User Required")
    .isAlpha().withMessage("Should contain only alphabets"),

    body("password")
    .notEmpty().withMessage("password required")
    .isLength({min: 8}).withMessage("Should be of atleast 8 characters")
    .isAlpha().withMessage("Should contain atleast one letter, digit, special character")
]

const authRouter = Router();
authRouter.get("/signup", (req, res) => {

})
authRouter.post("/signup", validate , signup);
authRouter.post('/login', validate, login);

export default authRouter;