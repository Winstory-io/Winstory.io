import { createThirdwebClient } from "thirdweb";
import { thirdwebConfig } from "./config/thirdweb-config";

export const client = createThirdwebClient({
  clientId: thirdwebConfig.clientId,
}); 