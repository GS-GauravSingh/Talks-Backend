/*
If you need to store media or other types of files, you have two options: storing them on your server's disk or using cloud-based storage.

Cloudinary is a cloud-based media management platform that enables developers to upload, store, and efficiently deliver images and other media files.
*/

import { v2 as cloudinary } from "cloudinary";
import environmentVariables from "../environmentVariables.js";

cloudinary.config({
	cloud_name: environmentVariables.CLOUDINARY_CLOUD_NAME,
	api_key: environmentVariables.CLOUDINARY_API_KEY,
	api_secret: environmentVariables.CLOUDINARY_API_SECRET,
});

export default cloudinary;
