exports.verifyFace = async (photoUrl, userId) => {
  // Connect to AWS Rekognition / FaceIO
  // return { success: true, facialDataId: 'abc123' }
  return { success: true, facialDataId: userId + "-face" };
};
