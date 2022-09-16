const _ = require("lodash");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const loginUserAndSendCredentials = async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email }).catch((err) =>
            console.log(err)
        );
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (isPasswordCorrect) {
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
                expiresIn: "24h",
            });
            return res.status(200).json({
                status: true,
                message: "Login Successful",
                user: _.pick(user, ["_id", "name", "email"]),
                token: token,
            });
        }
        return res.status(400).json({
            status: false,
            message: "Wrong Password!",
            user: null,
            token: null,
        });
    } catch (error) {
        return res.json({ status: false, message: error.message });
    }
};

const signupUserAndSendCredentials = async(req, res) => {
    try {
        const { user } = req.body;
        const isAlreadyExist = await User.findOne({ email: user.email }).catch(
            (err) => console.log(err)
        );
        if (isAlreadyExist) {
            return res.json({
                status: false,
                message: "Email already exist, try login instead",
            });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        let newUser = new User(user);
        newUser = await newUser.save();
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "24h",
        });
        return res.status(200).json({
            status: true,
            user: _.pick(newUser, ["_id", "name", "email"]),
            token: token,
        });
    } catch (error) {
        return res.json({ status: false, message: error.message });
    }
};

module.exports = { loginUserAndSendCredentials, signupUserAndSendCredentials };