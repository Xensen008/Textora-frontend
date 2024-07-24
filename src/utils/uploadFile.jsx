// import axios from 'axios';

// const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_APP_CLOUDINARY_CLOUD_NAME}/auto/upload`.trim();

// const uploadFile = async (file) => {
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('upload_preset', 'Textora-file');
//     try {
//         const res = await axios.post(url, formData);
//         return res.data; // Accessing data directly
//     } catch (error) {
//         console.log(error);
//         throw error; // Rethrowing the error after logging or return null;
//     }
// };

// export default uploadFile;

import axios from 'axios';

// Construct the Cloudinary upload URL with environment variables for security and flexibility
const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_APP_CLOUDINARY_CLOUD_NAME}/auto/upload`.trim();

/**
 * Asynchronously uploads a file to Cloudinary.
 * 
 * @param {File} file - The file to be uploaded.
 * @returns {Promise<Object>} The response data from Cloudinary on successful upload.
 * @throws {Error} Throws an error if the upload fails.
 */
const uploadFile = async (file) => {
    // Initialize FormData to send the file to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'Textora-file'); 
    try {
        const response = await axios.post(url, formData);
        return response.data;
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
};

export default uploadFile;



