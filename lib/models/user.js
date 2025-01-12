import { model, models, Schema } from "mongoose";

const userSchema = new Schema(
	{
		clerkId: {
			type: String,
			required: true,
		},
		username: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		avatarUrl: {
			type: String,
			required: false,
		},
		admin: {
			type: Boolean,
			required: false,
			default: false,
		},

		firstName: {
			type: String,
			required: false,
		},
		lastName: {
			type: String,
			required: false,
		},
	},
	{ timestamps: true },
);

const User = models?.User || model("User", userSchema);

export default User;
