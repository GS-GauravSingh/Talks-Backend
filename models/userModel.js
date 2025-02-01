const mongoose = require("mongoose");
const validator = require("validator"); // for email validation.
const bcrypt = require("bcrypt"); // `bcrypt` npm package for password hashing.

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

/*
Mongoose allows us to define middleware (also called pre (pre means before) and post (post means after) hooks) that run before or after certain operations on Mongoose documents, queries, aggregates, or models. One common use case is hashing a password before storing it in the database.
*/

// Now, I'm going to hash the user's password beforing storing in into the database. So, we have to perform an operation before the data gets stored in the database. We have to use `pre` middleware.
userSchema.pre("save", async function (next) {
    // isModified("fieldName") → Checks if a specific field is modified or not. It returns true when provided field is modified. Otheriwise it return false.
    if (!this.isModified("password") || !this.password) {
        return;
    }

    // Using `bcrypt` npm package for hashing password.
    // salt rounds means how many times we perform this hashing process. More rounds means more security by scrambling the information forther, altough at the cost of more computing power. Recommended value is 10.
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;
    next(); // calling the next middleware.
});

// Now, I'm going to hash the user's OTP beforing storing in into the database. So, we have to perform an operation before the data gets stored in the database. We have to use `pre` middleware.
userSchema.pre("save", async function (next) {
    // isModified("fieldName") → Checks if a specific field is modified or not. It returns true when provided field is modified. Otheriwise it return false.
    if (!this.isModified("otp") || !this.otp) {
        return;
    }

    // Using `bcrypt` npm package for hashing OTP.
    // salt rounds means how many times we perform this hashing process. More rounds means more security by scrambling the information forther, altough at the cost of more computing power. Recommended value is 10.
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(this.otp, saltRounds);
    this.otp = hashedOTP;
    next(); // calling the next middleware.
});

/*
Mongoose schema methods allow you to define custom instance methods that can be called on documents.
*/
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.compareOTP = async function (enteredOTP) {
    return await bcrypt.compare(enteredOTP, this.otp);
};

userSchema.methods.isTokenValid = function(jwtTimestamp){
    if(this.passwordChangedAt)
    {
        // JWT Timestamps (`exp`, `iat`) are in seconds, whereas, `Date.now()` represents time in milliseconds.
        // So to compare both of them together, you can either convert JWT Timestamps to milliseconds or convert `Date.now()` into seconds.

        // Converting `Date.now()` into seconds.
        // To convert time in milliseconds into second, we just have to divide the time by 1000, because in 1 second we have 1000 milliseconds.
        const changedTimeStamp = Math.floor(this.passwordChangedAt.getTime() / 1000);

        // If the token was issued after password change, then it is a valid token. Otherwise, if the token was issued before the password changed, then it is invalid token.
        return jwtTimestamp > changedTimeStamp; 
    }

    // if the field `passwordChangedAt` is empty, it means user haven't changed the password after the token was issued.
    return true;
}

// Creating a model using User Schema.
const userModel = mongoose.model("User", userSchema);

// Export the user model.
module.exports = userModel;
