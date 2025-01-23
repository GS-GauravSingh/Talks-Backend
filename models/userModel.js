const mongoose = require("mongoose");
const validator = require("validator");

// Creating User Schema
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true, // removes any leading or trailing whitespace.
            required: [true, "Name is required."], // set this field as required and adding a custom error message.
        },

        email: {
            type: String,
            required: [true, "Email is required."],
            unique: true, // email has to be unique and it ensures that no duplicate emails are stored in the database.
            trim: true, // removes any leading or trailing whitespace.

            // See, email has a specified format. So, we have to add a validation for email so that we can verify whether the given email is valid or not.
            // Mongoose allows us to define custom validators according to our needs. Use Mongoose `validate` property to define a custom validator.
            validate: {
                // `validator` is a function used for email validation. The `validator` function automatically receives the current value of the field (in this case, the email field) as an argument.
                // And this function is automatically invoked
                validator: function (email) {
                    // Using `validator` npm package for email validation.
                    // It's a synchronous functions and returns a boolean value (true or false) based on the validation result.
                    return validator.isEmail(email);
                },

                // `message` property is used to specify the error message that will be returned if the validation fails (i.e., when the `validator` function returns false).
                message: (props) => {
                    // The `props` object contains information about the validation context and `prop.value` contains the value of the field being validated (i.e., email).
                    return `Email (${props.value}) is invalid!`;
                },
            },
        },

        password: {
            type: String, // we are going to hash/encrypt the password before storing into the database.
            required: [true, "Password is required."],
            trim: true,
        },

        passwordChangedAt: {
            type: Date, // to keep a track of when user changed their account password.
        },

        verified: {
            type: Boolean, // used to check whether user has verified their email or not.
            default: false, // default value is false
        },

        otp: {
            type: String, // for OTP verification. First, we send the OTP to the user's provided email address and when the user enters the OTP for verification, then we check whether the user entered the OTP is the same as what we have generated and sent to the user.
        },

        otpExpiryTime: {
            type: Date, // used to set OTP expiry time.
        },

        status: {
            type: String, // used to check whther the user is either online or offline.
            enum: ["ONLINE", "OFFLINE"],
            default: "OFFLINE",
        },
    },
    { timestamps: true }
);

// Creating a model using User Schema.
const userModel = mongoose.model("User", userSchema);

// Export the user model.
module.exports = userModel;
