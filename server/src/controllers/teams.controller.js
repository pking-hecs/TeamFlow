import { getTeamsByUser } from "../models/team.model.js";

const getUserTeams = async (req, res) => {
    try {
        const email = req.user.email; // populated by authenticateToken middleware
        const teams = await getTeamsByUser(email);
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching teams" });
    }
}

export { getUserTeams };
