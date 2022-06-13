import * as solutionsWasm from './solutions_wasm';

/**
 * Required data to process turn the input frame into a packet.
 */
export type FrameMetadata = solutionsWasm.FrameMetadataWasm;

/**
 * Represents a normalized rectangle that can be passed to a StreamListener.
 */
export type NormalizedRect = solutionsWasm.NormalizedRect;

/**
 * Represents a detected landmark.
 */
export type NormalizedLandmark = solutionsWasm.NormalizedLandmark;

/**
 * Represents a list of landmarks.
 */
export type NormalizedLandmarkList = solutionsWasm.NormalizedLandmarkList;

/**
 * Represents one of the possible results that can be passed to the listener.
 * TODO(mhays): Surface a typename so that someone who is coming at solutions
 * API directly can figure our which type they are looking at.
 */
export type RecognizedResult =
    NormalizedLandmarkList|NormalizedRect|number|undefined;

/**
 * Represents a single result of a multi result listener.
 */
export interface ResultMap {
  [key: string]: RecognizedResult;
}

/**
 * This represents the callbacks from the graph's stream listeners.
 */
export type ResultMapListener = (map: ResultMap) => void;

/**
 * Option descriptions that describe where to change an option in a graph.
 */
export type GraphOptionXRef = solutionsWasm.GraphOptionXRef;

/**
 * If your files are organized in some weird structure, you can customize how
 * the path is constructed by sending this to the config options for Solution.
 */
export type FileLocatorFn = (file: string, prefix: string) => string;


/**
 * During configuration, the user can specify streams and callbacks to be
 * attached to the graph. These will get reregistered on the user's behalf if
 * the graph gets reset.
 */
export type AttachListenerFn =
    (wants: string[], listener: (results: ResultMap) => void) => void;

/**
 * Users of the solution set options using a key-value map. However, specific
 * solutions will constrain the options with an exported interface.
 *
 * e.g.
 *
 * generalSolution.setOptions({\"myKey\": myValue}) becomes
 * specificSolution.setOptions({ myKey: myValue }}
 *
 * declare interface SpecificSolutionOptionList {
 *   myKey: number
 * };
 *
 * This works because `Object`s in JavaScript are just hashmaps, and we fit
 * meaning on top of those hashmaps with our type declarations.
 */
export interface OptionList {
  [key: string]: unknown;
}

/**
 * Used in the constructor of Graph.
 */
export interface Graph {
  url: string;
}

/**
 * Describes how to interpret OptionConfig. @see GraphOptionChangeRequest.
 * e.g., A NUMBER tells us to fill out valueNumber (which gets interpreted as
 * a double on the C++ side). We will add other types here as the need arises.
 */
export enum OptionType {
  NUMBER,
}

/**
 * Used to register keys with the solution. Right now it is limited to
 * graphOptionXref, which is specifically for options that will be fed to the
 * MediaPipe graph, but we'll also need options that are handled by the specific
 * solution to do work (e.g., selfie-flipping).
 */
export interface OptionConfig {
  type: OptionType;
  graphOptionXref?: GraphOptionXRef;
}

/**
 * The collection of option configuration entries, arranged by option name.
 */
export interface OptionConfigMap {
  [optionName: string]: OptionConfig;
}

/**
 * Options to configure the solution.
 */
export interface SolutionConfig {
  /**
   * The pack loader and the wasm loader need to be here. A file loader will be
   * provided to them, and They will get loaded asynchronously. We won't
   * continue initialization until they've completely loaded and run.
   */
  files: string[];

  /**
   * The binary graph. Can support multiple ways of getting that graph.
   */
  graph: Graph;

  /**
   * See FileLocatorFn. Any file loading done on the user's behalf will use
   * locateFile if its profived. This includes WASM blobs and graph urls.
   */
  locateFile?: FileLocatorFn;

  /**
   * Specifies how to interpret options fed to setOptions.
   */
  options?: OptionConfigMap;

  /**
   * Whenever the graph is reset, this callback will be invoked. It is here that
   * you can attach listeners to the graph.
   */
  onRegisterListeners?: (attachFn: AttachListenerFn) => void;
}

/**
 * Represents a graph that can be fed to mediapipe Solution.
 */
export interface GraphData {
  toArrayBuffer(): Promise<ArrayBuffer>;
}

// These export names come from wasm_cc_binary BUILD rules. They belong to two
// different scripts that are loaded in parallel (see Promise.all, below).
// Because they mutate their respective variables, there is a race condition
// where they will stomp on each other if they choose the same name. Users
// won't normally see this race condition because they put script tags in the
// HTML, and HTML guarantees that the scripts will be run in order.
const API_EXPORT_NAME = 'createMediapipeSolutionsWasm';
const PACK_EXPORT_NAME = 'createMediapipeSolutionsPackedAssets';

/**
 * Extracts the result from a collection of results.
 */
function extractWasmResult(result: solutionsWasm.ResultWasm): RecognizedResult {
  if (result.isNumber()) {
    return result.getNumber();
  }
  if (result.isRect()) {
    return result.getRect();
  }
  if (result.isLandmarks()) {
    return result.getLandmarks();
  }
  return undefined;
}

/**
 * Returns the default path to a resource if the user did not overload the
 * locateFile parameter in SolutionConfig.
 */
function defaultLocateFile(file: string, prefix: string) {
  return prefix + file;
}

/**
 * Sets an arbitrary value on `window`. This is a typing wrapper to prevent
 * errors for using `window` improperly.
 */
function setWindow<T>(key: string, value: T): void {
  (window as unknown as {[key: string]: T})[key] = value;
}

/**
 * Gets an arbitrary value from `window`. This is a typing wrapper to prevent
 * errors for using `window` improperly.
 */
function getWindow(key: string): unknown {
  return (window as unknown as {[key: string]: unknown})[key];
}

/**
 * Dynamically loads a ascript into the current page and returns a `Promise`
 * that resolves when its loading is complete.
 */
function loadScript(url: string): Promise<void> {
  const script = document.createElement('script');
  script.setAttribute('src', url);
  script.setAttribute('crossorigin', 'anonymous');
  document.body.appendChild(script);
  return new Promise((resolve) => {
    script.addEventListener('load', () => {
      resolve();
    }, false);
  });
}

function getPackagePath(): string {
  if (typeof window === 'object') {
    return window.location.pathname.toString().substring(
               0, window.location.pathname.toString().lastIndexOf('/')) +
        '/';
  } else if (typeof location !== 'undefined') {
    // worker
    return location.pathname.toString().substring(
               0, location.pathname.toString().lastIndexOf('/')) +
        '/';
  } else {
    throw new Error(
        'solutions can only be loaded on a web page or in a web worker');
  }
}

class GraphDataImpl {
  constructor(
      private readonly graph: Graph, private readonly locateFile: FileLocatorFn,
      private readonly packagePath: string) {}

  async toArrayBuffer(): Promise<ArrayBuffer> {
    if (this.graph.url) {
      const fetched =
          await fetch(this.locateFile(this.graph.url, this.packagePath));
      if (fetched.body) {
        return fetched.arrayBuffer();
      }
    }
    return new ArrayBuffer(0);
  }
}

/**
 * Inputs to the graph. Currently only one input, a video frame, is
 * permitted, but this should encompass any input data to a solution.
 */
export interface FrameInputs {
  video: HTMLVideoElement;
}



/**
 * MediaPipe Solution upon which all specific solutions will be built.
 */
export class Solution {
  private readonly packagePath: string;
  private readonly locateFile: FileLocatorFn;

  // BEGIN: Assigned during initializeWasm...
  private glCanvas!: HTMLCanvasElement;
  private gl!: WebGL2RenderingContext;
  private wasm!: solutionsWasm.MediapipeWasm;
  private solutionWasm!: solutionsWasm.SolutionWasm;
  // END: Assigned during initializeWasm...

  private pendingChanges?: solutionsWasm.GraphOptionChangeRequest[];

  private needToInitializeWasm = true;
  private needToInitializeGraph = true;

  constructor(private readonly config: SolutionConfig) {
    this.locateFile = (config && config.locateFile) || defaultLocateFile;
    this.packagePath = getPackagePath();
  }

  close(): Promise<void> {
    if (this.solutionWasm) {
      this.solutionWasm.delete();
    }
    return Promise.resolve();
  }

  /**
   * Loads all of the dependent WASM files. This is heavy, so we make sure to
   * only do this once.
   */
  private async tryToInitializeWasm(): Promise<void> {
    if (!this.needToInitializeWasm) {
      return;
    }
    // Set up the file loader for both external loaders.
    setWindow(API_EXPORT_NAME, {locateFile: this.locateFile});
    setWindow(PACK_EXPORT_NAME, {locateFile: this.locateFile});

    const files = (this.config.files) || [];
    await Promise.all(
        files.map(x => loadScript(this.locateFile(x, this.packagePath))));

    // The variables we set earlier will not be mutated, each according to its
    // related loader.
    const apiFn = getWindow(API_EXPORT_NAME) as solutionsWasm.ApiPromiseFn;
    const packFn = getWindow(PACK_EXPORT_NAME) as solutionsWasm.PackLoader;

    // Now that everything is loaded and mutated, we can finally initialize
    // the WASM loader with the pack loader. The WASM loader will wait until
    // all of the files in the pack loader are complete before resolving its
    // Promise.
    this.wasm = await apiFn(packFn);

    // TODO(mhays): Developer should be able to explicitly load/unload a
    // solution to prevent stealing all of the WebGL resources (e.g., Chrome
    // may limit the number of WebGL contexts by domain).
    this.glCanvas = document.createElement('canvas');
    this.wasm.canvas = this.glCanvas;

    this.wasm.createContext(
        this.glCanvas, /* useWebGl= */ true,
        /* setInModule= */ true, {});

    // The graph only needs to be loaded once into the solution, but the WASM
    // might re-initialize the solution, and that will specifically happen
    // during wasm.ProcessFrame.
    this.solutionWasm = new this.wasm.SolutionWasm();
    const graphData =
        new GraphDataImpl(this.config.graph, this.locateFile, this.packagePath);
    await this.loadGraph(graphData);

    this.needToInitializeWasm = false;
  }

  /**
   * Sets the options for the graph, potentially triggering a reinitialize.
   * The triggering is contingent upon the options matching those set up in
   * the solution configuration. If a match is found, initialize is set to run
   * on the next processFrame.
   *
   * We do not create a WASM object here, because it's possible (likely) that
   * WASM has not loaded yet (i.e., the user calls setOptions before calling
   * processFrame / initialize).  We'll do that during initialize when we know
   * it's safe.
   */
  setOptions(options: OptionList): void {
    if (!this.config.options) {
      return;
    }
    const pendingChanges: solutionsWasm.GraphOptionChangeRequest[] = [];
    for (const option of Object.keys(options)) {
      // Look each option in the option config.
      const optionConfig = this.config.options[option];
      if (optionConfig) {
        if (optionConfig.graphOptionXref) {
          const optionValue = {
            valueNumber: optionConfig.type === OptionType.NUMBER ?
                options[option] as number :
                undefined
          };
          // Combine the xref with the value. This is what the WASM will be
          // expecting.
          const request = {...optionConfig.graphOptionXref, ...optionValue};
          pendingChanges.push(request);
        }
      }
    }

    if (pendingChanges.length !== 0) {
      this.needToInitializeGraph = true;
      this.pendingChanges = pendingChanges;
    }
  }

  /**
   * Initializes the graph is it has not been loaded, or has been triggered to
   * reload (setOptions was called while the graph was running).
   */
  private async tryToInitializeGraph() {
    if (!this.needToInitializeGraph) {
      return;
    }
    this.solutionWasm.bindTextureToCanvas();
    // Move the video frame into the texture.
    const gl = this.glCanvas.getContext('webgl2');
    if (!gl) {
      alert('Failed to create WebGL canvas context when passing video frame.');
      return;
    }
    this.gl = gl;

    // Changing options on the graph will mutate the graph config.
    if (this.pendingChanges) {
      const changeList = new this.wasm.GraphOptionChangeRequestList();
      for (const change of this.pendingChanges) {
        changeList.push_back(change);
      }
      this.solutionWasm.changeOptions(changeList);
      changeList.delete();
      this.pendingChanges = undefined;
    }

    if (this.config.onRegisterListeners) {
      this.config.onRegisterListeners(this.attachListener.bind(this));
    }

    this.needToInitializeGraph = false;
  }

  async initialize(): Promise<void> {
    await this.tryToInitializeWasm();
    await this.tryToInitializeGraph();
  }

  async loadGraph(graph: GraphData): Promise<void> {
    const graphData = await graph.toArrayBuffer();
    this.solutionWasm.loadGraph(graphData);
  }

  /**
   * TODO(mhays): frame inputs will be an array of {name, packet}.
   */
  async processFrame(
      inputStreamName: string, metadata: FrameMetadata,
      inputs: FrameInputs): Promise<void> {
    await this.initialize();
    const gl = this.gl;
    this.solutionWasm.bindTextureToCanvas();
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, inputs.video);

    this.solutionWasm.processFrame(inputStreamName, {
      width: inputs.video.videoWidth,
      height: inputs.video.videoHeight,
      timestampMs: performance.now()
    });
  }

  /**
   * Attaches a listener that will be called when the graph produces
   * compatible packets on the named stream.
   */
  private attachListener(wants: string[], listener: ResultMapListener): void {
    const wantsCopy = [...wants];
    const wantsVector = new this.wasm.StringList();
    for (const want of wants) {
      wantsVector.push_back(want);
    }
    const wasmListener = {
      onResults: (values: solutionsWasm.ResultWasmList) => {
        const results: ResultMap = {};
        for (let index = 0; index < wants.length; ++index) {
          results[wantsCopy[index]] = extractWasmResult(values.get(index));
        }
        listener(results);
      }
    };
    const packetListener = this.wasm.PacketListener.implement(wasmListener);
    this.solutionWasm.attachMultiListener(wantsVector, packetListener);
    wantsVector.delete();
  }
}

//goog.exportSymbol('Solution', Solution);

