import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};


/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 * @body { username, email, password }
 */
export async function register(req, res) {

    const { username, email, password } = req.body;

    try {
        const isUserAlreadyExists = await userModel.findOne({
            $or: [ { email }, { username } ]
        })

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "User with this email or username already exists",
                success: false,
                err: "User already exists"
            })
        }

        const user = await userModel.create({ username, email, password })

        const emailVerificationToken = jwt.sign({
            email: user.email,
        }, process.env.JWT_SECRET)

        await sendEmail({
            to: email,
            subject: "Welcome to Perplexity!",
            html: `
                    <p>Hi ${username},</p>
                    <p>Thank you for registering at <strong>Perplexity</strong>. We're excited to have you on board!</p>
                    <p>Please verify your email address by clicking the link below:</p>
                    <a href="${process.env.BACKEND_URL || "http://localhost:3000"}/api/auth/verify-email?token=${emailVerificationToken}">Verify Email</a>
                    <p>If you did not create an account, please ignore this email.</p>
                    <p>Best regards,<br>The Perplexity Team</p>
            `
        })

        res.status(201).json({
            message: "User registered successfully",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("register error:", error)
        res.status(500).json({
            message: error.message || "Registration failed. Please try again.",
            success: false,
        })
    }

}

/**
 * @desc Login user and return JWT token
 * @route POST /api/auth/login
 * @access Public
 * @body { email, password }
 */
export async function login(req, res) {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
                success: false,
                err: "User not found"
            })
        }

        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Invalid email or password",
                success: false,
                err: "Incorrect password"
            })
        }

        if (!user.verified) {
            return res.status(400).json({
                message: "Please verify your email before logging in",
                success: false,
                err: "Email not verified"
            })
        }

        const token = jwt.sign({
            id: user._id,
            username: user.username,
        }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.cookie("token", token, cookieOptions)

        res.status(200).json({
            message: "Login successful",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.error("login error:", error)
        res.status(500).json({
            message: error.message || "Login failed. Please try again.",
            success: false,
        })
    }

}


/**
 * @desc Get current logged in user's details
 * @route GET /api/auth/get-me
 * @access Private
 */
export async function getMe(req, res) {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
        return res.status(404).json({
            message: "User not found",
            success: false,
            err: "User not found"
        })
    }

    res.status(200).json({
        message: "User details fetched successfully",
        success: true,
        user
    })
}


/**
 * @desc Log out the current user by clearing the auth cookie
 * @route POST /api/auth/logout
 * @access Private
 */
export async function logout(req, res) {
    res.clearCookie("token", cookieOptions)

    res.status(200).json({
        message: "Logged out successfully",
        success: true
    })
}


/**
 * @desc Sign up or log in a user using a Google ID token
 * @route POST /api/auth/google
 * @access Public
 * @body { credential }
 */
export async function googleLogin(req, res) {
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json({
            message: "Missing Google credential",
            success: false,
            err: "Missing credential"
        })
    }

    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid Google credential",
            success: false,
            err: err.message
        })
    }

    const { email, name, sub: googleId } = payload;

    try {
        let user = await userModel.findOne({ $or: [ { email }, { googleId } ] });

        if (!user) {
            let baseUsername = (name || email.split("@")[ 0 ]).replace(/\s+/g, "").toLowerCase();
            let username = baseUsername;
            let suffix = 0;
            while (await userModel.findOne({ username })) {
                suffix++;
                username = `${baseUsername}${suffix}`;
            }

            user = await userModel.create({
                username,
                email,
                googleId,
                verified: true,
            });
        } else if (!user.googleId) {
            user.googleId = googleId;
            user.verified = true;
            await user.save();
        }

        const token = jwt.sign({
            id: user._id,
            username: user.username,
        }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.cookie("token", token, cookieOptions)

        res.status(200).json({
            message: "Logged in with Google successfully",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.error("googleLogin error:", error)
        res.status(500).json({
            message: error.message || "Google sign-in failed. Please try again.",
            success: false,
        })
    }
}


/**
 * @desc Verify user's email address
 * @route GET /api/auth/verify-email
 * @access Public
 * @query { token }
 */
export async function verifyEmail(req, res) {
    const { token } = req.query;

    try {


        const decoded = jwt.verify(token, process.env.JWT_SECRET);


        const user = await userModel.findOne({ email: decoded.email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid token",
                success: false,
                err: "User not found"
            })
        }

        user.verified = true;

        await user.save();

        const html =
            `
        <h1>Email Verified Successfully!</h1>
        <p>Your email has been verified. You can now log in to your account.</p>
        <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/login">Go to Login</a>
    `

        return res.send(html);
    } catch (err) {
        return res.status(400).json({
            message: "Invalid or expired token",
            success: false,
            err: err.message
        })
    }
}