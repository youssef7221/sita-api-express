import multer from "multer";

// memoryStorage عشان Sharp يشتغل على الـ buffer
export const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max قبل الـ compress
    },

    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, PNG, WebP images are allowed"));
        }
    },
});