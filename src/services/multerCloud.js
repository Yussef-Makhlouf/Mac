import multer from "multer";
import { allowedExtensions } from "../utilities/allowedExtensions.js";
import CustomError from "../utilities/customError.js";

export const multerCloudFunction = (allowedExtensionsArr) => {

  if (!allowedExtensionsArr) {
    allowedExtensionsArr = allowedExtensions.Image;
  }

  const storage = multer.memoryStorage();

  const fileFilter = (req, file, cb) => {

    const isMimeAllowed = allowedExtensionsArr.includes(file.mimetype);

    const isPdfByName =
      file.originalname.toLowerCase().endsWith(".pdf");

    if (isMimeAllowed || isPdfByName) {
      return cb(null, true);
    }

    return cb(
      new CustomError("invalid extension", 400),
      false
    );
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
      fieldSize: 10 * 1024 * 1024 // 10MB for any field
    }
  });
};

export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'File is too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};
