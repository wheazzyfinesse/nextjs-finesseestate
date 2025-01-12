"use server";

import User from "../models/user";
import { connectDB } from "../mongodb/mongoose";

export const createOrUpdateUser = async (id, email_addresses, image_url, first_name, last_name, username) => {
	try {
		await connectDB();
		const newUser = await User.findOneAndUpdate(
			{ clerkId: id },
			{
				$set: {
					username: username,
					firstName: first_name,
					lastName: last_name,
					email: email_addresses[0].email_address,
					avatarUrl: image_url,
				},
			},
			{ upsert: true, new: true },
		);
		console.log("user created or updated");
		return JSON.parse(JSON.stringify(newUser));
	} catch (error) {
		console.log(error);
	}
};

export const deleteUser = async (id) => {
	try {
		await connectDB();
		await User.findOneAndDelete({ clerkId: id });
		console.log("deleted user");
	} catch (error) {
		console.log(error);
	}
};
