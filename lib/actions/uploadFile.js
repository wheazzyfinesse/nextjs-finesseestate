import { supabase } from "../supabase/supabse";

export const uploadFile = async (file) => {
    const { data, error } = await supabase.storage
        .from('realestate') // Replace with your bucket name
        .upload('images', file, {
            cacheControl: '3600', // Cache control headers
            upsert: false, // Avoid overwriting existing files
        });

    if (error) {
        console.error('Error uploading file:', error.message);
        return;
    }
    console.log('File uploaded successfully:', data);
    return data
}



export const uploadMultipleFiles = async (files, bucketName, folderName) => {
    const uploadedFiles = [];

    for (const file of files) {
        const filePath = `${folderName}/${file.name}`;
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false, // Prevent overwriting files
            });

        if (error) {

            return error

        } else {

            const { data: uploadedData, error } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath);

            if (error) {
                console.error("Error getting public URL for uploaded file:", error);
            }
            uploadedFiles.push(uploadedData.publicUrl);
        }
    }

    return uploadedFiles;
}





export const deleteFileByUrl = async (url) => {
    const bucketName = 'realestate'; // Replace with your bucket name



    // Extract the file path from the URL
    const relativePath = url.split(`${bucketName}/`)[1]; // Get the path after the bucket name

    if (!relativePath) {
        console.error("Invalid URL or bucket name does not match.");
        return;
    }
    // Remove the file using Supabase storage
    const { data, error } = await supabase.storage
        .from(bucketName)
        .remove([relativePath]);

    if (error) {
        return error
    } else {
        return data
    }

};
