const cloudinary = require("./cloudinary.client");

exports.uploadToCloudinary = (file, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);

      resolve(result);
    });

    stream.end(file.buffer);
  });
};

/**
 * Destroys a Cloudinary asset by its public id. Returns the raw Cloudinary
 * response, whose `result` is "ok" on success or "not found" when the asset does
 * not exist (destroying a missing asset is not treated as an error here).
 */
exports.destroyFromCloudinary = (publicId, options) => {
  return cloudinary.uploader.destroy(publicId, options);
};
