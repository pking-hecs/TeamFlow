const user = [];

const insertUser = async (name, password) => {
    user.push({
        username: name,
        password: password
    });
}

const findUser = async (name) => {
    user.find(u => u.username === name);
}

export {insertUser, findUser};