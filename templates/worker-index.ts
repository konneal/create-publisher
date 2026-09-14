// The deployment entry: inject THIS publisher's profile into the
// engine, then re-export the engine worker. Everything else — routes,
// pipeline, stages, prompts — is @konneal/engine.
import worker, { setProfile } from "@konneal/engine";
import { PROFILE } from "./profile.gen.ts";

setProfile(PROFILE);

export default worker;
