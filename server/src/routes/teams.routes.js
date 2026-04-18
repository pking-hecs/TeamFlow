import { Router } from "express";
import { getUserTeams } from "../controllers/teams.controller.js";
import authenticateToken from "../middleware/auth.middleware.js";

const teamsRouter = Router();

teamsRouter.get("/", authenticateToken, getUserTeams);

export default teamsRouter;
