import * as faceapi from "face-api.js";

let modelsLoaded = false;

async function ensureModelsLoaded() {
  if (modelsLoaded || typeof window === "undefined") {
    return;
  }

  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
  ]);

  modelsLoaded = true;
}

export async function compareFaceImages(
  referenceImageUrl: string,
  candidateImageDataUrl: string,
  threshold = 0.6
) {
  await ensureModelsLoaded();

  const [referenceImage, candidateBlob] = await Promise.all([
    faceapi.fetchImage(referenceImageUrl),
    fetch(candidateImageDataUrl).then((response) => response.blob()),
  ]);

  const candidateImage = await faceapi.bufferToImage(candidateBlob);

  const [referenceFace, candidateFace] = await Promise.all([
    faceapi.detectSingleFace(referenceImage).withFaceLandmarks().withFaceDescriptor(),
    faceapi.detectSingleFace(candidateImage).withFaceLandmarks().withFaceDescriptor(),
  ]);

  if (!referenceFace || !candidateFace) {
    return false;
  }

  const distance = faceapi.euclideanDistance(
    referenceFace.descriptor,
    candidateFace.descriptor
  );

  return distance < threshold;
}
