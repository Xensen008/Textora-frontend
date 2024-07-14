import axios from 'axios';

const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_APP_CLOUDINARY_CLOUD_NAME}/auto/upload`.trim();

const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'Textora-file');
    try {
        const res = await axios.post(url, formData);
        return res.data; // Accessing data directly
    } catch (error) {
        console.log(error);
        throw error; // Rethrowing the error after logging or return null;
    }
};

export default uploadFile;