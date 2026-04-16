import sharp from "sharp";
import cloudinary from "../config/cloudinary";
interface UploadOptions {
    folder: string;          // اسم الـ folder في Cloudinary
    width?: number;          // عرض الصورة
    height?: number;         // ارتفاع الصورة
    quality?: number;        // جودة الصورة 1-100
}
export const uploadImage = async (
    buffer: Buffer,
    options: UploadOptions
): Promise<string> => {
    // 1. Sharp — Compress + Resize + Convert to WebP
    const compressed = await sharp(buffer)
        .resize(options.width || 800, options.height || 800, {
            fit: "inside",        // بيحافظ على الـ aspect ratio
            withoutEnlargement: true, // مش بيكبّر لو الصورة صغيرة
        })
        .webp({ quality: options.quality || 80 })
        .toBuffer();
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: options.folder,
                resource_type: "image",
                format: "webp",
            },
            (error, result) => {
                if (error) reject(new Error(error.message));
                else resolve(result!.secure_url);
            }
        ).end(compressed);
    });
};
// مسح صورة من Cloudinary
export const deleteImage = async (imageUrl: string): Promise<void> => {
    // بنسحب الـ public_id من الـ URL
    const parts = imageUrl.split("/");
    const folder = parts[parts.length - 2];
    const filename = parts[parts.length - 1].split(".")[0];
    const publicId = `${folder}/${filename}`;
    await cloudinary.uploader.destroy(publicId);
}; 