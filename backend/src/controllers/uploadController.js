const { uploadImage } = require("../services/cloudinary");

exports.uploadSingle = async (req, res) => {
  try {
    console.log("UPLOAD ROUTE HIT");
    console.log("FILE RECEIVED:", !!req.file);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("CLOUDINARY CONFIG:", {
      cloud: process.env.CLOUDINARY_CLOUD_NAME,
      key: process.env.CLOUDINARY_API_KEY ? "SET" : "MISSING",
      secret: process.env.CLOUDINARY_API_SECRET ? "SET" : "MISSING",
    });

    const base64 = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${base64}`;

    console.log("BASE64 LENGTH:", base64.length);

    const options = {};
    if (req.file.mimetype?.startsWith("video/")) {
      options.resource_type = "video";
    } else if (req.file.mimetype?.startsWith("application/")) {
      options.resource_type = "auto";
    }

    const result = await uploadImage(dataURI, req.body.folder || "general", options);

    console.log("UPLOAD RESULT:", result);

    return res.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error("CLOUDINARY UPLOAD ERROR >>>", err);
    return res.status(500).json({
      error: "Upload failed",
      details: err.message,
    });
  }
};
