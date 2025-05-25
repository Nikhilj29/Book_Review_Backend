import e from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../index.js";

export const signUpController =  async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const userExists = await db.query('SELECT * FROM usercredential WHERE username = $1', [username]);

        if (userExists.rows.length > 0) {
            return res.status(400).json({sucess:false, message: 'User already exists' });
        }

        await db.query(
            'INSERT INTO usercredential (username, password) VALUES ($1, $2)',
            [username, hashedPassword]
        );

        res.status(201).json({sucess:true, message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({sucess:false, message: 'Server error' });
    }
}

export const loginController = async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await db.query('SELECT * FROM usercredential WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({sucess:false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ username: user.username}, process.env.jwt_token, { expiresIn: '1h' });
        console.log(token,"token");
        res.json({sucess:true,message:"Logged In SuccessFully", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({sucess:false, message: 'Server error' });
    }
}