const config = require('config.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const User = db.User;
const Auditor = db.Auditor;
module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    getAuditors,
    logOut
};

async function authenticate({ username, password, clietnIPAddress}) {
    const user = await User.findOne({ username });
    if (user && bcrypt.compareSync(password, user.hash)) {
        const { hash, ...userWithoutHash } = user.toObject();
        const userParam = user.toObject();
        delete userParam['_id'];
        delete userParam['hash']
        userParam['LogIn'] = new Date();
        userParam['LogOut'] = '';
        userParam['IP'] = clietnIPAddress;
        const auditor = new Auditor(userParam);
        const audData = await auditor.save();
        const token = jwt.sign({ sub: user.id }, config.secret);
        const auditorId = audData._id
        return {
            ...userWithoutHash,
            token,
            auditorId
        };
    }
}

async function logOut(id) {
    const user = await Auditor.update({'_id':id},{$set:{'logOut':new Date()}});
    return user
}

async function getAll() {
    // return await User.find().select('-hash');
    const data = await User.find().select('-hash');
    return data;
}

async function getAuditors(userName) {
    const user = await User.findOne({ username: userName })
    if(user && user.role==='Auditor') {
        const data = await Auditor.find().select('-hash');
        return data;
    } else {
        return 'no access'
    }
    
}

async function getById(id) {
    return await User.findById(id).select('-hash');
}

async function create(userParam) {
    // validate
    if (await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    const user = new User(userParam);

    // hash password
    if (userParam.password) {
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // save user
    await user.save();
}

async function update(id, userParam) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    // hash password if it was entered
    if (userParam.password) {
        userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // copy userParam properties to user
    Object.assign(user, userParam);

    await user.save();
}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}