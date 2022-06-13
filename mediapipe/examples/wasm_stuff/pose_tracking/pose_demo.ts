/**
 * @fileoverview Demonstrates a minimal use case for MediaPipe pose tracking.
 */

import {MediaPipeCamera} from 'google3/third_party/mediapipe/web/solutions/camera_util/index';
import * as drawing from 'google3/third_party/mediapipe/web/solutions/demo_utils/drawing_utils';
import * as poseApi from 'google3/third_party/mediapipe/web/solutions/pose_tracking/index';

// Our input frames will come from here.
const video = document.getElementById('video') as HTMLVideoElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const canvasCtx = canvas.getContext('2d')!;

function onResults(results: poseApi.Results): void {
  if (!results.pose) {
    return;
  }
  const landmarks = results.pose.landmarks;
  const rect = results.pose.rect;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

  drawing.drawConnectors(
      canvasCtx, landmarks, poseApi.LANDMARK_CONNECTIONS, '#00FF00');
  drawing.drawLandmarks(canvasCtx, landmarks, '#FF0000');
  drawing.drawRectangle(
      canvasCtx, rect.xCenter, rect.yCenter, rect.width, rect.height,
      rect.rotation, '#0000FF30');

  canvasCtx.restore();
}

const solution = new poseApi.PoseSolution();
solution.onResults(onResults);

// The solution is already connected to the video, we just need to use
// the camera to drive it.
const camera = new MediaPipeCamera({
  video,
  onFrame: async () => {
    await solution.send({video});
  }
});
camera.start();

// Every so often we'll change the options to show that the graph is restarting
// properly.
const thresholds = [0.2, 0.8, 10];
let thresholdIndex = 0;
function cycleThreshold(): void {
  setTimeout(() => {
    const newThreshold = thresholds[thresholdIndex];
    console.log(`switching threshold to ${newThreshold}`);
    solution.setOptions({poseThreshold: newThreshold});
    thresholdIndex = (thresholdIndex + 1) % thresholds.length;
    cycleThreshold();
  }, 10000);
}
cycleThreshold();



