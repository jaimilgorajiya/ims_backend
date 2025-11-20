import User from '../models/User.Models.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import Randomstring from 'randomstring';


export const sendResetEmail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    requireTLS: true,
                    auth:{
                        user: "jaimilgorajiya@gmail.com",
                        pass: "nzypnviwlrzntbhp" ,

                    }    
                });

        const mailOptions = {
            from: "jaimilgorajiya@gmail.com",
            to: email,
            subject: "For Reset Password",
            html: `<p>Hi ${name}, Please click on the link to reset your password
             <a href="http://localhost:5173/reset-password?token=${token}">Click Here</a></p>`
        }; 

        transporter.sendMail(mailOptions, function(error,info){
            if(error){
                console.log("Error:", error);
            }
            else{
                console.log("Email has been sent:- ", info.response);
            }
        })

    } catch (error) {
        res.status(500).json({message: 'Server error'});
    }
}

export const register = async (req, res) => {
    try{
        const {username, email, password, confirm_password} = req.body;

        if(!username || !email || !password || !confirm_password){
            return res.status(400).json({message: 'All fields are required'});
        }

        if(password !== confirm_password){
            return res.status(400).json({message: 'Password does not match'});
        }

        const existingEmail = await User.findOne({email});
        if(existingEmail){
            return res.status(400).json({message: 'Email already registered'});
        }

        const existingUsername = await User.findOne({username});
        if(existingUsername){
            return res.status(400).json({message: 'Username already taken'});
        }

        const hashedPassword = await bcrypt.hash(password,12);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });
        res.status(201).json({message:"User Registered successfully",data:newUser});
    }
    catch(error){
            console.error("Register error:", error);
            if (error && error.code === 11000) {
                const dupField = Object.keys(error.keyPattern || {})[0] || 'field';
                const msg = dupField === 'email' ? 'Email already registered' : dupField === 'username' ? 'Username already taken' : 'Duplicate value';
                return res.status(400).json({message: msg});
            }
            res.status(500).json({message: 'Server error'});
    }
};

export const login = async(req, res) => {
    try {
        console.log('Login attempt received');
        const {email, password} = req.body;

        // Validate input
        if(!email || !password){
            console.log('Validation failed: Missing email or password');
            return res.status(400).json({message: 'Email and password are required'});
        }

        console.log('Checking for user with email:', email);

        // Check if JWT_SECRET is configured
        if(!process.env.JWT_SECRET){
            console.error('JWT_SECRET is not configured in environment variables');
            return res.status(500).json({message: 'Server configuration error. Please contact administrator.'});
        }

        const user = await User.findOne({email});

        if(!user){
            console.log('User not found with email:', email);
            return res.status(400).json({message:"Invalid email or password"});
        }

        console.log('User found:', user.username, 'User ID:', user._id);

        // Check if user has a password
        if(!user.password){
            console.error('User found but password field is missing or empty');
            return res.status(500).json({message: 'User data error. Please contact administrator.'});
        }

        // Check if user._id exists
        if(!user._id){
            console.error('User found but _id is missing');
            return res.status(500).json({message: 'User data error. Please contact administrator.'});
        }

        console.log('Comparing password...');
        const isMatch = await bcrypt.compare(password, user.password);
        
        if(!isMatch){
            console.log('Password mismatch for user:', email);
            return res.status(400).json({message:"Invalid email or password"})
        }

        console.log('Password matched! Generating token...');
        
        // Convert user._id to string if it's an ObjectId
        const userId = user._id.toString ? user._id.toString() : user._id;
        
        const token = jwt.sign({userId: userId}, process.env.JWT_SECRET, {expiresIn: '1d'});

        console.log('Token generated successfully for user:', userId);
        res.status(200).json({message:"Login successfully", token});
        
    } catch (error) {
        console.error('Login error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({message: 'Server error. Please try again later.', error: error.message});
    }
}

export const forgetPassword = async(req,res) => {
    try {
        
        const {email} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"User Not Found"});
        }
        const randomString = Randomstring.generate();
        const data = await User.updateOne({email:email},{$set:{token:randomString}});
        sendResetEmail(user.username, user.email, randomString);

        res.status(200).json({
        success: true,
        message: "Password reset email sent successfully!",
        data: data
    });

    } catch (error) {
        res.status(500).json({message: 'Server error'});
    }
}

export const resetPassword = async(req,res) => {
    try {
        const {token} = req.query;
        const tokenData = await User.findOne({token:token})
        if(tokenData){
            const {password} = req.body;
            const hashedPassword = await bcrypt.hash(password,12);
            const userData = await User.updateOne({token:token},{$set:{password:hashedPassword, token:''}});
            return res.status(200).json({message:"Password reset successfully", data:userData});
        }
        else{
            res.status(400).json({message:"Invalid token"});
        }
    } catch (error) {
        res.status(500).json({message: 'Server error'});
    }
}