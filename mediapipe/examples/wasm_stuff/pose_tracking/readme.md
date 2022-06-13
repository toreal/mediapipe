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
 
 ## Represents one of the possible results that can be passed to the listener.\n *
  TODO(mhays): Surface a typename so that someone who is coming at solutions\n 
  * API directly can figure our which type they are looking at.\n */\n
  
  export type RecognizedResult =
  NormalizedLandmarkList|NormalizedRect|number|undefined;

  
  ## Represents a single result of a multi result listener. 
  
  export interface ResultMap {
        [key: string]: RecognizedResult;
  }
  
  ## This represents the callbacks from the graph's stream listeners.
  export type ResultMapListener = (map: ResultMap) =