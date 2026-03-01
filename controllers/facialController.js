const User = require("../models/User");
const facialService = require("../services/facialService");

exports.verifyFace = async (req, res) => {
  const photoUrl = req.file
    ? `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
    : req.body?.photoUrl;
  const result = await facialService.verifyFace(photoUrl, req.user.id);
  if (!result.success)
    return res.status(400).json({ msg: "Face verification failed" });
  await User.findByIdAndUpdate(req.user.id, {
    faceVerified: true,
    facialDataId: result.facialDataId,
    faceVerificationImage: photoUrl || undefined,
  });
  res.json({ success: true, facialDataId: result.facialDataId });
};
