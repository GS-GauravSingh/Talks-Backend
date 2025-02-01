const userModel = require("../models/userModel");
const asyncHandler = require("../utils/asyncHandler").asyncHandlerPromise;
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const otpGenerator = require("otp-generator");
const sendOTPMail = require("../utils/mailer");
const generateOtpEmail = require("../templates/OtpTemplate");
const JWT = require("../utils/JWT");

// Register user.
const register = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    // Check whether the user already exists with the provided email or not.
    const existingUser = await userModel.findOne({
        email: email,
        verified: true,
    });

    // If we are able to find the document in database where email property is equal to the above email and verified property set to true. It means user already exists and it is a verified user.
    if (existingUser) {
        // Email already exists and user cannot create their account with this email.
        const error = new ApiError(400, `Email (${email}) already exists`);
        return next(error); // return after calling the global error handling middleware.
    }

    // If the above `if` condition does not execute, it means there is no previous record. Hence, we can register this user.
    const newUser = await userModel.create(
        {
            name: name,
            email: email,
            password: password,
        },
        {
            new: true, // this ensures that the new updated document gets returned.
            validateModifiedOnly: true, // run validations only on modified fields.
        }
    );

    req.userDocId = newUser._id;

    next(); // calling the next middlware.
});

// Send OTP to the provided email address.
const sendOTP = asyncHandler(async (req, res, next) => {
    const { userDocId } = req;

    // Generate OTP - Using `otp-generator` npm package for generating OTP.
    /*
    Arguments of generate function: generate(length, options)

    1. length - length of password. Optional if options is optional. default length is 10.

    2. options - optional
    - digits - Default: true true value includes digits in OTP
    - lowerCaseAlphabets - Default: true true value includes lowercase alphabets in OTP
    - upperCaseAlphabets - Default: true true value includes uppercase alphabets in OTP
    - specialChars - Default: true true value includes special Characters in OTP
    */
    const generatedOTP = otpGenerator.generate(4, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
    });

    // Set the OTP Expiry time
    const otpExpiryTime = Date.now() + 10 * 60 * 1000; // OTP will expire in 10 minutes after creation.

    // fetch the user document for database and update the fields OTP and otpExpiryTime in the user document.
    const updateUser = await userModel.findByIdAndUpdate(
        userDocId,
        {
            otp: generatedOTP.toString(),
            otpExpiryTime: otpExpiryTime,
        },
        {
            new: true, // this ensures that the new updated document gets returned.
            validateModifiedOnly: true, // run validations only on modified fields.
        }
    );

    // Now, we have to send the OTP to the user's email.
    // Using `nodemailer` npm package for sending OTP.
    const otpEmail = generateOtpEmail({
        recipientName: updateUser.name,
        otp: generatedOTP,
    });

    // Send OTP
    sendOTPMail({
        receiverEmail: updateUser.email,
        subject: "Your OTP for Talks: Complete the Verification",
        text: `Here's your OTP fo email verification: ${generatedOTP}. \nDo not share this OTP with anyone.`,
        htmlMessage: otpEmail,
    });

    const apiResponse = new ApiResponse(
        200,
        "Success",
        null,
        "OTP sent successfully!"
    );
    return res.status(apiResponse.statusCode).json({
        status: apiResponse.status,
        message: apiResponse.message,
    });
});

// Verify OTP.
const verifyOTP = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.body;

    // find the user with the provided email.
    const user = await userModel.findOne({
        email: email,
        otpExpiryTime: { $gt: Date.now() },
    });

    if (!user) {
        const apiError = new ApiError(
            400,
            "Either the email was incorrect or the OTP was expired"
        );
        return next(apiError);
    }

    if (user.verified) {
        const apiError = new ApiError(400, "Email is already verified.");
        return next(apiError);
    }

    if (!(await user.compareOTP(otp))) {
        const apiError = new ApiError(400, "Incorrect OTP!");
        return next(apiError);
    }

    // If we reach this point, It means OTP is correct.
    user.verified = true;
    user.otp = undefined; // when we set this to undefined, it is not visible in the mongoDB. We needed the OTP only once during the registration process.

    // save the document.
    const updatedUser = await user.save({
        new: true, // this ensures that the new updated document gets returned.
        validateModifiedOnly: true, // run validations only on modified fields.
    });

    // Now, when the user is verified. Generate and send the JWT token to the user.
    const jwt = new JWT();
    const token = jwt.signToken({ userId: updatedUser._id });

    // Sending the jwt token as a cookie.
    const apiResponse = new ApiResponse(
        200,
        "Success",
        null,
        "OTP verified successfully!"
    );

    // setting jwt token cookie expiry data.
    // 7 days from now: Date.now() + days * hoursPerDay * minutesPerHour * secondsPerMinute * 1000.
    // 7 * 24 * 60 * 60 * 1000: 7 days time in milliseconds.
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return res
        .status(apiResponse.statusCode)
        .cookie("jwt-token", token, {
            httpOnly: true, // Cookie is accessible only by the web server, Prevents client-side JavaScript from accessing the cookie.
            expires: sevenDaysFromNow, // setting cookie expiry time
            sameSite: "None", // Allows the cookie to be sent in cross-site requests
            secure: true, // only allow cookies to be sent over https and localhost (http) for development purpose.
        })
        .json({
            status: apiResponse.status,
            message: apiResponse.message,
            jwtToken: token,
        });
});

// Resend OTP
const resendOTP = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    const user = await userModel.findOne({ email: email });

    if (!user) {
        const apiError = new ApiError(400, "Incorrect Email!");
        return next(apiError);
    }

    // Generate OTP - Using `otp-generator` npm package for generating OTP.
    /*
    Arguments of generate function: generate(length, options)

    1. length - length of password. Optional if options is optional. default length is 10.

    2. options - optional
    - digits - Default: true true value includes digits in OTP
    - lowerCaseAlphabets - Default: true true value includes lowercase alphabets in OTP
    - upperCaseAlphabets - Default: true true value includes uppercase alphabets in OTP
    - specialChars - Default: true true value includes special Characters in OTP
    */
    const generatedOTP = otpGenerator.generate(4, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
    });

    // Set the OTP Expiry time
    const otpExpiryTime = Date.now() + 10 * 60 * 1000; // OTP will expire in 10 minutes after creation.

    // update the fields OTP and otpExpiryTime in the user document.
    user.otp = generatedOTP.toString();
    user.otpExpiryTime = otpExpiryTime;

    // save the changes made to the user document.
    await user.save({});

    // Now, we have to send the OTP to the user's email.
    // Using `nodemailer` npm package for sending OTP.
    const otpEmail = generateOtpEmail({
        recipientName: user.name,
        otp: generatedOTP,
    });

    // Send OTP
    sendOTPMail({
        receiverEmail: user.email,
        subject: "Your OTP for Talks: Complete the Verification",
        text: `Here's your OTP fo email verification: ${generatedOTP}. \nDo not share this OTP with anyone.`,
        htmlMessage: otpEmail,
    });

    const apiResponse = new ApiResponse(
        200,
        "Success",
        null,
        "OTP sent successfully!"
    );
    return res.status(apiResponse.statusCode).json({
        status: apiResponse.status,
        message: apiResponse.message,
    });
});

// Login
const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        const apiError = new ApiError(400, `Some required fields are missing.`);
        return next(apiError);
    }

    const user = await userModel.findOne({ email: email, verified: true });

    if (!user) {
        const apiError = new ApiError(
            400,
            `User with provided email (${email}) doesn't exists. Please register yourself first.`
        );
        return next(apiError);
    }

    // Check whether password is correct or not.
    if (!(await user.comparePassword(password))) {
        // Incorrect Password
        const apiError = new ApiError(400, `Incorrect Password!`);
        return next(apiError);
    }

    // Creating JWT Token.
    const jwt = new JWT();
    const token = jwt.signToken({ userId: user._id });

    // Sending the jwt token as a cookie.
    const apiResponse = new ApiResponse(
        200,
        "Success",
        null,
        `User with provided email (${email}) exisits.`
    );

    // setting jwt token cookie expiry data.
    // 7 days from now: Date.now() + days * hoursPerDay * minutesPerHour * secondsPerMinute * 1000.
    // 7 * 24 * 60 * 60 * 1000: 7 days time in milliseconds.
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return res
        .status(apiResponse.statusCode)
        .cookie("jwt-token", token, {
            httpOnly: true, // Cookie is accessible only by the web server, Prevents client-side JavaScript from accessing the cookie.
            expires: sevenDaysFromNow, // setting cookie expiry time
            sameSite: "None", // Allows the cookie to be sent in cross-site requests
            secure: true, // only allow cookies to be sent over https and localhost (http) for development purpose.
        })
        .json({
            status: apiResponse.status,
            message: apiResponse.message,
            jwtToken: token,
        });
});

// Logout
const logout = asyncHandler(async (req, res, next) => {
    // to logout the user, we just have to override the value of jwtToken on the client size.
    const apiResponse = new ApiResponse(
        200,
        "Success",
        null,
        `User successfully signed out!`
    );

    return res
        .status(apiResponse.statusCode)
        .cookie("jwt-token", "", {
            httpOnly: true, // Cookie is accessible only by the web server, Prevents client-side JavaScript from accessing the cookie.
            expires: sevenDaysFromNow, // setting cookie expiry time
            sameSite: "None", // Allows the cookie to be sent in cross-site requests
            secure: true, // only allow cookies to be sent over https and localhost (http) for development purpose.
        })
        .json({
            status: apiResponse.status,
            message: apiResponse.message,
            jwtToken: "",
        });
});

// Protect - There are some routes we don't want any un-authorized user can access.
const isUserAuthorized = asyncHandler(async (req, res, next) => {
    // get the token
    let token = req.cookie.jwtToken || "";

    // check whether token exists or not.
    if (!token) {
        const apiError = new ApiError(
            401,
            `Authentication Failed: User is not authenticated.`
        );
        return next(apiError);
    }

    // if token exists then verify it.
    const jwt = new JWT();
    const decoded = jwt.verifyToken(token);

    // check if there is any user exists with the id `userId`.
    const user = await userModel.findById(decoded.userId);

    if (!user || !user.verified) {
        const apiError = new ApiError(
            401,
            `The user belonging to this token does no longer exists.`
        );
        return next(apiError);
    }

    // check if user changed the password after the jwt token was issued.
    if (!user.isTokenValid(decoded.iat)) {
        const apiError = new ApiError(
            401,
            `The user has recently changed their account password! Pleas log in again.`
        );
        return next(apiError);
    }

    req.user = user;
    next(); // calling the next middleware.
});
