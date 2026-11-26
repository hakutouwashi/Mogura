export async function preloadImages(riddles, createImage = () => new Image()) {
  const preloadedImages = new Map();
  const groups = await Promise.all(Object.entries(riddles).map(async ([group, items]) => {
    const decoded = await Promise.all(items.map(async item => {
      try {
        const image = createImage();
        image.src = item.url;
        await image.decode();
        preloadedImages.set(item.url, image);
        return item;
      } catch (error) {
        console.error(`Could not decode riddle image: ${item.id}`, error);
        return null;
      }
    }));
    return [group, decoded.filter(Boolean)];
  }));
  return { riddles: Object.fromEntries(groups), preloadedImages };
}
