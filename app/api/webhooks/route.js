import { Webhook } from "svix";
import { headers } from "next/headers";
import { clerkClient } from "@clerk/nextjs/server";
import { createOrUpdateUser, deleteUser } from "@/lib/actions/user";

export async function POST(req) {
	const SIGNING_SECRET = process.env.SIGNING_SECRET;

	if (!SIGNING_SECRET) {
		throw new Error(
			"Error: Please add WEBHOOK_SIGNING_SECRET from Clerk Dashboard to .env or .env.local",
		);
	}

	// Create new Svix instance with secret
	const wh = new Webhook(SIGNING_SECRET);

	// Get headers
	const headerPayload = await headers();
	const svix_id = headerPayload.get("svix-id");
	const svix_timestamp = headerPayload.get("svix-timestamp");
	const svix_signature = headerPayload.get("svix-signature");

	// If there are no headers, error out
	if (!svix_id || !svix_timestamp || !svix_signature) {
		return new Response("Error: Missing Svix headers", {
			status: 400,
		});
	}

	// Get body
	const payload = await req.json();
	const body = JSON.stringify(payload);

	let evt;

	// Verify payload with headers
	try {
		evt = wh.verify(body, {
			"svix-id": svix_id,
			"svix-timestamp": svix_timestamp,
			"svix-signature": svix_signature,
		});
	} catch (err) {
		console.error("Error: Could not verify webhook:", err);
		return new Response("Error: Verification error", {
			status: 400,
		});
	}

	// Do something with payload
	// For this guide, log payload to console
	const { id } = evt.data;
	const eventType = evt.type;

	// Add user to your database or any other storage if eventType is user.created

	if (eventType === "user.created" || eventType === "user.updated") {
		const { id, email_addresses, image_url, first_name, last_name, username } =
			evt.data;

		try {
			const user = await createOrUpdateUser(id, email_addresses, image_url, first_name, last_name, username);
			if (user && eventType === "user.created") {
				const clerk = await clerkClient()
				try {
					await clerk.users.updateUserMetadata(id, {
						publicMetadata: {
							userMongoId: user._id,
						},
					})
				} catch (error) {
					console.log("Error, could not update user metadata", error)
				}
			}
			console.log("user created", user)
			return new Response("user created or updated", { status: 200 });
		} catch (error) {
			console.log("error creating user", error);
			return new Response("Error occured", { status: 400 });
		}
	}

	// Delete user from your database or any other storage if eventType is user.deleted
	if (eventType === "user.deleted") {
		const { id } = evt.data;
		await deleteUser(id);
		return new Response("user deleted", { status: 200 });
	}

	return new Response("Webhook received", { status: 200 });
}
