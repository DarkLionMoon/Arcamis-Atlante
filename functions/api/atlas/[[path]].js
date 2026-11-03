import {handleAtlas} from '../../../server/atlas-api.mjs';
export function onRequest(context){return handleAtlas(context.request,context.env);}
