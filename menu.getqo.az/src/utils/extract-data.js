export const extractData = (pages) => {
  return pages?.reduce((acc, curr) => acc.concat(curr.data), []);
}