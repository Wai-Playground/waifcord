// author = shokkunn

import { z } from "zod";
import { BaseDataInterface } from "../../base/BaseData";

/** Types */

BaseDataInterface.extend({
    owner_id: z.string(),
    target_id: z.string(),

    relationship: z.string(),
    description: z.string().optional(),
})