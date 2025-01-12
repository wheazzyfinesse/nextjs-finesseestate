
import Listing from '@/lib/models/listing';
import { connectDB } from '@/lib/mongodb/mongoose';
import { currentUser } from '@clerk/nextjs/server';
export const POST = async (req) => {
    const user = await currentUser();
    try {
        await connectDB();
        const data = await req.json();
        if (!user || user.publicMetadata.userMongoId !== data.userMongoId) {
            return new Response('Unauthorized', {
                status: 401,
            });
        }
        const newListing = await Listing.create({
            user: user.publicMetadata.userMongoId,
            name: data.name,
            description: data.description,
            address: data.address,
            regularPrice: data.regularPrice,
            discountPrice: data.discountPrice,
            bathrooms: data.bathrooms,
            bedrooms: data.bedrooms,
            furnished: data.furnished,
            parking: data.parking,
            type: data.type,
            offer: data.offer,
            imageUrls: data.imageUrls,
        });

        return new Response(JSON.stringify(newListing), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify(error), {
            status: 500
        });
    }
};