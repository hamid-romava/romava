import { clientGuide } from "../../../lib/client-guides";

export function GET(request: Request) {
  return clientGuide(request);
}
