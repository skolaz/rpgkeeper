//----------------------------------------------------------------------------------------------------------------------
// Supplement
//----------------------------------------------------------------------------------------------------------------------

export interface SupplementOptions {
    id : number;
    name : string;
    owner ?: string;
    scope : 'public' | 'user';
    official : boolean;

    // There are additional properties to most supplements
    [ key : string ] : unknown;
}

//----------------------------------------------------------------------------------------------------------------------
