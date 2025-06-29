import bcrypt from "bcryptjs";
import User from "../models/user.model";
import ApiError from "../utils/ApiError";


const compareLockerPin = asyncHandler(async (req, res, next) => {
    try {
        const {pin } = req.headers;
        const user = await User.findById(req.user._id)

        if(!pin || pin.length <6 )
        {
            throw new ApiError(401, "Pin is required to compare Locker Pin");
        }

        if(!user.lockedPin)
        {
            throw new ApiError (401, "Locker Pin is not set");
        }

        const match = await bcrypt.compare(pin, user.lockedPin);
        if(!match)
        {
            throw new ApiError(402, "Locker Pin does not match, try again");
        }

        next();
    }
    catch(error){
        throw new ApiError(500, "Pin could not be compared", error);
    }
});

export default compareLockerPin;