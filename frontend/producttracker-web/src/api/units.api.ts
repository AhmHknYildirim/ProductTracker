import { http } from "./http";
import type { UnitResponse } from "../types/unit";

export const unitsApi = {
    list: () => http.get<UnitResponse[]>("/api/units"),
};
