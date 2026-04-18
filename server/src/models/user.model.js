const user = [];

const insertUser = async (name, email, password) => {
    user.push({
        username: name,
        email: email,
        password: password
    });
}

const findUser = async (email) => {
    return user.find(u => u.email === email);
}

export {insertUser, findUser};