import { LifecycleService } from "./lifecycle.service.js";


const service =
  new LifecycleService();


await service.run();