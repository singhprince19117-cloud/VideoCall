import httpStatus from "http-status";
import { user } from "../models/users.model.js";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";
import { meeting } from "../models/meeting.model.js";


const userRegister = async (req, res) => {
    const { name, userName, password } = req.body;

    if (!name || !userName || !password) {
        return res.status(httpStatus.NOT_FOUND).json({ message: "the person is missing, go to sabji mandi police station" });
    }

    try {
        const isExisting = await user.findOne({ userName });

        if (isExisting) {
            return res.status(httpStatus.FOUND).json({ message: "Sourav Mishra has been found, and the money has been recovered." });
        }

        const hashedPassword = await hash(password, 10);

        const newUser = new user({
            name: name,
            userName: userName,
            password: hashedPassword
        });

        await newUser.save();

        res.status(httpStatus.CREATED).json({ message: "user registered" });
    }
    catch (e) {

        res.json({ message: `sourav mishra is missing: ${e}` });
    }
};


const userLogin = async (req, res) => {
    const { userName, password } = req.body;

    if (!userName || !password) {
        return res.status(httpStatus.NOT_FOUND).json({ message: "the person is missing, go to sabji mandi police station" });
    }

    try {
        const User = await user.findOne({ userName });
        if (!User) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "sourav mishra not found" });
        }

        const isPassword = await bcrypt.compare(password, User.password);
        if (isPassword) {
            let token = crypto.randomBytes(10).toString("hex");

            User.token = token;
            await User.save();

            return res.status(httpStatus.OK).json({ token: token });
        }

        // the frontside was spinning endlessly, because i forgot to add else statement
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "ye sourav ka ghar nahi hai, sahi password daalo" });
    }
    catch (e) {
        return res.status(500).json({ message: `Something went wrong ${e}` });
    }
};

const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        const users = await user.findOne({ token: token });
        const meetings = await meeting.find({ user_id: users.userName });
        res.json(meetings)
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        const users = await user.findOne({ token: token });

        const newMeeting = new meeting({
            user_id: users.userName,
            meetingCode: meeting_code
        });

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added code to history" })
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}

export { userLogin, userRegister, getUserHistory, addToHistory };