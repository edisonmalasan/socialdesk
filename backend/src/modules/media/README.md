# Media Module

## Purpose

The Media module owns Cloudinary configuration and shared upload middleware. Provider modules use it for image and video uploads.

## Public Module API

- `cloudinary.client.js` exports the configured Cloudinary v2 client.
- `upload.middleware.js` exports multer memory storage middleware.
- `media.service.js` exposes a shared `uploadToCloudinary(file, options)` helper for future provider cleanup.

## Upload Contracts

Current public multipart field names are preserved:

- Facebook direct photo: `source`
- Facebook scheduled photo: `source`
- Instagram image post: `source`
- Instagram Reel post: `source`
- Pinterest pin image: `file`

Current Cloudinary folders are preserved:

- `fb_posts`
- `social_posts`
- `pinterest_posts`

## Dependencies

- Libraries: `cloudinary`, `multer`
- Environment variables: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Known Limits

Some provider services still contain local upload helper functions to preserve behavior exactly during the structural migration. They can be consolidated onto `media.service.js` in a later cleanup pass.
