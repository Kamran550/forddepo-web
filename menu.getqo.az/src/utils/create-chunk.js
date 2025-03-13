export const createChunk = (array, chunkSize = 2) => {
  let lastTitle = "";
  const chunks = [];
  for (let i = 0; i < array?.length; i += 1) {
    for (let j = 0; j < array[i]?.products.length; j += chunkSize) {
      const chunk = array[i]?.products.slice(j, j + chunkSize);
      if (lastTitle !== array[i]?.translation?.title) {
        chunks.push({ title: array[i].translation?.title, chunk });
        lastTitle = array[i]?.translation?.title;
      } else {
        chunks.push({ chunk });
      }
    }
  }
  return chunks;
};
