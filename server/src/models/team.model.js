const teams = [
    { id: 1, name: "Alpha Team", description: "The first team", members: ["admin@example.com", "testuser@example.com"] },
    { id: 2, name: "Beta Squad", description: "The second team", members: ["testuser@example.com"] },
    { id: 3, name: "Gamma Group", description: "The third team", members: ["admin@example.com"] }
];

const getTeamsByUser = async (email) => {
    return teams.filter(team => team.members.includes(email));
}

const getAllTeams = async () => {
    return teams;
}

export { getTeamsByUser, getAllTeams };
