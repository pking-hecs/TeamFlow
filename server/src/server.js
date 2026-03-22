import express from "express"
import authRouter from "./routes/auth.routes.js"
import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
app.use(express.urlencoded({extended:true}));


app.get("/", authRouter);

app.listen(3000, () => {

})