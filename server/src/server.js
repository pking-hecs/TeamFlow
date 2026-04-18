import express from "express"
import cors from "cors"
import authRouter from "./routes/auth.routes.js"
import teamsRouter from "./routes/teams.routes.js"
import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/api/auth", authRouter);
app.use("/api/teams", teamsRouter);

app.listen(3000, () => {
    console.log("Server running on port 3000");
})