"import * as solutionsApi from 'google3/third_party/mediapipe/web/solutions/solutions_api';

/**
 * PoseEvent.onPose returns an array of landmarks. This array provides the
 * edges to connect those landmarks to one another.
 */
export const LANDMARK_CONNECTIONS = [
  [0, 1],   [1, 2],   [2, 3],   [3, 7],   [0, 4],   [4, 5],   [5, 6],
  [6, 8],   [9, 10],  [11, 12], [11, 13], [13, 15], [15, 17], [15, 19],
  [15, 21], [17, 19], [12, 14], [14, 16], [16, 18], [16, 20], [16, 22],
  [18, 20], [11, 23], [12, 24], [23, 24]
];

/**
 * Represents a WASM backed, read-only vector.
 */
declare interface ReadOnlySimpleVector<T> {
  get(index: number): T;
  size(): number;
}

/**
 * Represents a normalized rectangle. Has an ID that should be consistent
 * across calls.
 */
declare interface NormalizedRect {
  xCenter: number;
  yCenter: number;
  height: number;
  width: number;
  rotation: number;
  rectId: number;
}

/**
 * Represents a single normalized landmark.
 */
export interface NormalizedLandmark {
  x: number;
  y: number;
  visibility: number;
}

/**
 * Description of pose. A possible reults from PoseSolution.
 */
export interface Pose {
  landmarks: ReadOnlySimpleVector<NormalizedLandmark>;
  rect: NormalizedRect;
}

/**
 * Legal inputs for PoseSolution.
 */
export interface Inputs {
  video: HTMLVideoElement;
}

/**
 * Possible results from PoseSolution.
 */
export interface Results {
  pose: Pose;
}

/**
 * Configurable options for PoseSolution.
 */
export interface Options {
  poseThreshold: number;
}

/**
 * Listener for any results from PoseSolution.
 */
export type ResultsListener = (results: Results) => (Promise<void>|void);

/**
 * Contains all of the setup config for the pose solution.
 */
export interface PoseSolutionConfig {
  locateFile?: (path: string, prefix?: string) => string;
}

/**
 * Encapsulates the entire Pose solution. All that is needed from the developer
 * is the source of the image data. The user will call `send` repeatedly, and if
 * a pose is detected, then the user can receive callbacks with this metadata.
 */
export class PoseSolution {
  private readonly solution: solutionsApi.Solution;
  private listener?: ResultsListener;

  constructor(config?: PoseSolutionConfig) {
    config = config || {};
    this.solution = new solutionsApi.Solution({
      locateFile: config.locateFile,
      files: [
        'pose_tracking_solution_packed_assets_loader.js',
        'pose_tracking_solution_wasm_bin.js'
      ],
      graph: {url: 'pose_web.binarypb'},
      onRegisterListeners: (attachFn: solutionsApi.AttachListenerFn) => {
        const thiz = this;
        // The listeners can be attached before or after the graph is loaded.
        // We will eventually hide these inside the pose api so that a
        // developer doesn't have to know the stream names.
        attachFn(
            ['pose_landmarks', 'pose_rect'],
            (results: solutionsApi.ResultMap) => {
              if (thiz.listener) {
                thiz.listener({
                  pose: {
                    landmarks: results['pose_landmarks'] as
                        solutionsApi.NormalizedLandmarkList,
                    rect: results['pose_rect'] as solutionsApi.NormalizedRect
                  }
                });
              }
            });
      },
      options: {
        'poseThreshold': {
          type: solutionsApi.OptionType.NUMBER,
          graphOptionXref: {
            calculatorType: 'ThresholdingCalculator',
            calculatorIndex: 1,
            fieldName: 'threshold'
          }
        }
      }
    });
  }

  /**
   * Shuts down the object. Call before creating a new instance.
   */
  close(): Promise<void> {
    this.solution.close();
    return Promise.resolve();
  }

  /**
   * Registers a single callback that will carry any results that occur
   * after calling Send().
   */
  onResults(listener: ResultsListener): void {
    this.listener = listener;
  }

  /**
   * Initializes the solution. This includes loading ML models and mediapipe
   * configurations, as well as setting up potential listeners for metadata. If
   * `initialize` is not called manually, then it will be called the first time
   * the developer calls `send`.
   */
  async initialize(): Promise<void> {
    await this.solution.initialize();
  }

  /**
   * Sends inputs to the solution. The developer can await the results, which
   * resolves when the graph and any listeners have completed.
   */
  async send(inputs: Inputs): Promise<void> {
    if (inputs.video) {
      const video = inputs.video;
      await this.solution.processFrame(
          'input_frames_gpu', {
            height: video.videoHeight,
            width: video.videoWidth,
            timestampMs: performance.now()
          },
          {video});
    }
  }

  /**
   * Adjusts options in the solution. This may trigger a graph reload the next
   * time the graph tries to run.
   */
  setOptions(options: Options): void {
    this.solution.setOptions(options as unknown as solutionsApi.OptionList);
  }
}

goog.exportSymbol('LANDMARK_CONNECTIONS', LANDMARK_CONNECTIONS);
goog.exportSymbol('PoseSolution', PoseSolution);
"


sourcesContent":["/**
 * @fileoverview Demonstrates a minimal use case for MediaPipe pose tracking.
 */

import {MediaPipeCamera} from 'google3/third_party/mediapipe/web/solutions/camera_util/index';
import * as 
 from 'google3/third_party/mediapipe/web/solutions/demo_utils/
_utils';
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

  
.drawConnectors(
      canvasCtx, landmarks, poseApi.LANDMARK_CONNECTIONS, '#00FF00');
  
.drawLandmarks(canvasCtx, landmarks, '#FF0000');
  
.drawRectangle(
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
"]}




sourcesContent":["
/**
 * @fileoverview Provides a simple camera with a callback when a frame
 * is available.
 */

/**
 * User specified options.
 */

export interface CameraOptions {
  video: HTMLVideoElement;
  onFrame: () => Promise<void>| null;
  facingMode?: 'user'|'environment';
  width?: number;
  height?: number;
}

const defaultOptions = {
  facingMode: 'user',
  width: 640,
  height: 480
};

/**
 * Represents a mediadevice camera. It will start a camera and then run an
 * animation loop that calls the user for each frame. If the user spends too
 * much time in the callback, then animation frames will be dropped.
 */
export class Camera {
  // The video frame rate may be lower than the (browser-controlled) tick rate;
  // we use this to avoid processing the same frame twice.
  private lastVideoTime = 0;

  private readonly options: CameraOptions;

  constructor(options: CameraOptions) {
    this.options = {...defaultOptions, ...options} as CameraOptions;
  }

  /**
   * Drives tick() be called on the next animation frame.
   */
  private requestTick(): void {
    window.requestAnimationFrame(() => {
      this.tick();
    });
  }

  /**
   * Will be called when the camera feed has been acquired. We then start
   * streaming this into our video object.
   * @param {!MediaStream} stream The video stream.
   */
  private onAcquiredUserMedia(stream: MediaStream): void {
    this.options.video.srcObject = stream;
    this.options.video.onloadedmetadata = () => {
      this.options.video.play();
      this.requestTick();
    };
  }

  private tick(): void {
    let result: Promise<void>|null = null;
    // TODO(b/168744981): Do not schedule ticks when we are paused.
    if (!this.options.video.paused &&
        this.options.video.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = this.options.video.currentTime;
      result = this.options.onFrame();
    }
    if (result) {
      result.then(() => {
        this.requestTick();
      });
    } else {
      this.requestTick();
    }
  }

  start(): Promise<void> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // This can be worked around with legacy commands, but we choose not to
      // do so for this demo.
      alert('No navigator.mediaDevices.getUserMedia exists.');
    }
    const options = this.options;
    return navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: options.facingMode,
            width: options.width,
            height: options.height,
          }
        })
        .then(stream => {
          this.onAcquiredUserMedia(stream);
        })
        .catch(e => {
          console.error(`Failed to acquire camera feed: ${e}`);
          alert(`Failed to acquire camera feed: ${e}`);
          throw e;
        });
  }
}

// Prevent jsbinary from stripping this symbol.
goog.exportSymbol('MediaPipeCamera', Camera);
"]}




sourcesContent":[
    "import * as solutionsWasm from './solutions_wasm';

## Required data to process turn the input frame into a packet. 
export type FrameMetadata = solutionsWasm.FrameMetadataWasm;
 
## Represents a normalized rectangle that can be passed to a StreamListener.
 export type NormalizedRect = solutionsWasm.NormalizedRect;
 
 ## Represents a detected landmark.
 export type NormalizedLandmark = solutionsWasm.NormalizedLandmark;
 
 ## Represents a list of landmarks.
 export type NormalizedLandmarkList = solutionsWasm.NormalizedLandmarkList;
 
 ## Represents one of the possible results that can be passed to the listener.
 *
  TODO(mhays): Surface a typename so that someone who is coming at solutions
 
  * API directly can figure our which type they are looking at.
 */

  
  export type RecognizedResult =
  NormalizedLandmarkList|NormalizedRect|number|undefined;

  
  ## Represents a single result of a multi result listener. 
  
  export interface ResultMap {
        [key: string]: RecognizedResult;
  }
  
  ## This represents the callbacks from the graph's stream listeners.
  export type ResultMapListener = (map: ResultMap) =