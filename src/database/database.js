import mongoose from "mongoose";

async function connectMongoDB(mongoDbUrl) {
	try {
		const res = await mongoose.connect(mongoDbUrl);
		console.log(`MongoDB Connected Successfully: ${res.connection.host}`);
	} catch (error) {
		console.log("MongoDB Connection Error: ", error);
	}
}

export default connectMongoDB;
