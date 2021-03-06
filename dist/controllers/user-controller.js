"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userlogOut = exports.userLogIn = exports.registerNewUser = exports.getAllUsers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const uuid_1 = require("uuid");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// Get all users
exports.getAllUsers = async (ctx) => {
    try {
        const users = await user_model_1.User.findAll();
        if (!users || users.length === 0) {
            ctx.response.body = {
                message: 'No users found',
            };
            return;
        }
        ctx.response.status = 200;
        ctx.response.body = users;
    }
    catch (err) {
        console.log(err);
        ctx.response.status = 400;
        ctx.response.body = {
            message: 'Users fetch failed',
            err: err,
        };
    }
};
// Register new user
exports.registerNewUser = async (ctx) => {
    const { email, password } = ctx.request.body;
    const id = uuid_1.v4();
    try {
        // Check if User Exists in DB
        const emailExist = await user_model_1.User.findOne({
            where: {
                email: email,
            },
        });
        console.log(emailExist);
        if (emailExist) {
            ctx.response.status = 400;
            ctx.body = { message: 'Email is already exists' };
            return;
        }
        const isAdmin = !!ctx.request.body.isAdmin;
        // Hash password
        const salt = await bcrypt_1.default.genSalt(10);
        const hashPassword = await bcrypt_1.default.hash(password, salt);
        const newUser = await user_model_1.User.create({
            id: id,
            email: email,
            password: hashPassword,
            isAdmin: isAdmin,
        });
        ctx.response.status = 200;
        ctx.response.body = newUser;
    }
    catch (err) {
        console.log(err);
        ctx.response.status = 400;
        ctx.response.body = {
            message: 'Registration failed',
            err: err,
        };
    }
};
// Login
exports.userLogIn = async (ctx) => {
    try {
        const user = await user_model_1.User.findOne({
            where: {
                email: ctx.request.body.email,
            },
            raw: true,
        });
        if (!user) {
            ctx.response.status = 400;
            ctx.body = { message: 'Wrong credentials, try again' };
            return;
        }
        else {
            // Match password
            await bcrypt_1.default.compare(ctx.request.body.password, user.password, (err, isMatch) => {
                if (err) {
                    console.log(err);
                    ctx.response.status = 400;
                    ctx.response.body = {
                        message: 'Password compare failed',
                        err: err,
                    };
                    return;
                }
                if (isMatch) {
                    user.isloggedIn = true;
                    const token = jsonwebtoken_1.default.sign({ Id: user.id }, 'fsdgsdgsgdsg', {
                        expiresIn: '3h',
                    });
                    user.save();
                    ctx.response.status = 200;
                    ctx.response.body = {
                        id: user.id,
                        token: token,
                    };
                }
                else {
                    console.log('Wrong credentials, try again...');
                    ctx.response.status = 401;
                    ctx.response.body = {
                        message: 'Wrong credentials, try again...',
                    };
                }
            });
        }
    }
    catch (err) {
        console.log(err);
        ctx.response.status = 400;
        ctx.response.body = {
            message: 'Registration failed',
            err: err,
        };
    }
};
// Logout
exports.userlogOut = async () => {
    try {
        // logOut user...
    }
    catch (err) {
        console.log(err);
    }
};
