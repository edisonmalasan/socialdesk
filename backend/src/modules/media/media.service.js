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
