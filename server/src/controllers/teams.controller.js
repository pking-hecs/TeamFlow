import { getTeamsByUser } from "../models/team.model.js";

const getUserTeams = async (req, res) => {
    try {
        const username = req.user.username; // populated by authenticateToken middleware
        const teams = await getTeamsByUser(username);
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching teams" });
    }
}

export { getUserTeams };
