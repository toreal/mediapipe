import * as solutionsApi from 'google3/third_party/mediapipe/web/solutions/solutions_api';

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

//goog.exportSymbol('LANDMARK_CONNECTIONS', LANDMARK_CONNECTIONS);
//goog.exportSymbol('PoseSolution', PoseSolution);
"
