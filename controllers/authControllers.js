const userModel = require("../models/userModel");
const asyncHandler = require("../utils/asyncHandler").asyncHandlerPromise;
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const otpGenerator = require("otp-generator");
const sendOTPMail = require("../utils/mailer");
const generateOtpEmail = require("../templates/OtpTemplate");

// Register user.
const register = asyncHandler(async (req, res, next) => {
    const { name, email, password, confirmPassword } = req.body;

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

    // return res.status(200).json({
    //     status: "success",
    //     data: {
    //         user: newUser,
    //     },
    // });

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

    return res.status(200).json({
        status: "Success",
        message: "OTP sent successfully!",
    });
});

// Verify OTP.

// Protect
