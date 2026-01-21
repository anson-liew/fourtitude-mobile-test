export const recipeImages = {
  bkt: require("./image/bkt.png"),
  chickenChop: require("./image/chick-chop.png"),
  curryRice: require("./image/curry-rice.png"),
  nasiLemak: require("./image/nasi-lemak.png"),
  rotiCanoi: require("./image/roti-canoi.png"),
} as const;

export type RecipeImageKey = keyof typeof recipeImages;
