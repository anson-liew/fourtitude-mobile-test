export type RecipeTypeItem = {
  id: string;
  key: string;
  label: string;
};

const REMOTE_URL =
  "https://raw.githubusercontent.com/anson-liew/fourtitude-mobile-test/refs/heads/main/src/assets/data/recipetypes.remote.json";

export class RecipeTypeService {
  static async fetchRemote(): Promise<RecipeTypeItem[]> {
    const res = await fetch(REMOTE_URL);

    if (!res.ok) {
      throw new Error(`Failed to fetch recipe types: ${res.status}`);
    }

    const json = (await res.json()) as RecipeTypeItem[];

    if (!Array.isArray(json)) return [];

    return json.filter(
      (x) => x && typeof x.key === "string" && typeof x.label === "string",
    );
  }
}
