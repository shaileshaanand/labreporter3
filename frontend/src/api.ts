import { treaty } from "@elysiajs/eden";
import type { Api } from "../../api/app";

const api = treaty<Api>(window.location.host).api;

export default api;
