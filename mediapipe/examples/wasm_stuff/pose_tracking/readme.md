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