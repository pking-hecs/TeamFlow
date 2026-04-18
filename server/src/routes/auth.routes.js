import {Router} from "express"
import {body} from "express-validator"
import {signup, login} from "../controllers/auth.controller.js"
import authenticateToken from "../middleware/auth.middleware.js"

const validate = [
    body("username")
    .trim()
    .notEmpty().withMessage("User Required")
    .isAlphanumeric().withMessage("Should contain only letters and numbers"),

    body("password")
    .notEmpty().withMessage("password required")
    .isLength({min: 8}).withMessage("Should be of atleast 8 characters")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
    .withMessage("Should contain atleast one letter, digit, special character")
]

const authRouter = Router();

authRouter.post("/signup", validate, signup);
authRouter.post('/login', validate, login);
authRouter.get('/me', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

export default authRouter;