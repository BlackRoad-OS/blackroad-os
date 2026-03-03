import { episodes } from "../../../chronicles/index";

export async function GET() {
  return Response.json({
    episodes,
    totalEpisodes: episodes.length,
  });
}
