import sharp from "sharp";
import cloudinary from "../config/cloudinary";
interface UploadOptions {
    folder: string;          // اسم الـ folder في Cloudinary
    width?: number;          // عرض الصورة
    height?: number;         // ارتفاع الصورة
    quality?: number;        // جودة الصورة 1-100
}

export interface UploadImageResult {
    url: string;
    publicId: string;
}

export const uploadImage = async (
    buffer: Buffer,
    options: UploadOptions
): Promise<UploadImageResult> => {
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
                else {
                    resolve({
                        url: result!.secure_url,
                        publicId: result!.public_id,
                    });
                }
            }
        ).end(compressed);
    });
};
export const deleteImage = async (publicId: string): Promise<void> => {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== "ok" && result.result !== "not found") {
        throw new Error("Cloudinary delete failed");
    }
}; 