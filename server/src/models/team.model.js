const teams = [
    { id: 1, name: "Alpha Team", description: "The first team", members: ["admin", "testuser"] },
    { id: 2, name: "Beta Squad", description: "The second team", members: ["testuser"] },
    { id: 3, name: "Gamma Group", description: "The third team", members: ["admin"] }
];

const getTeamsByUser = async (username) => {
    return teams.filter(team => team.members.includes(username));
}

const getAllTeams = async () => {
    return teams;
}

export { getTeamsByUser, getAllTeams };
