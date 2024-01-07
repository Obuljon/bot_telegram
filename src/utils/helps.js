export function strlength(str, num) {
  let arr = [];
  let end = 0;
  for (let i = 0; i < str.length; i += num) {
    end += num;
    arr.push(str.slice(i, end));
  }
  return arr;
}

export function arrinstrforlength(arr, num) {
  return arr.map(item => (item = strlength(item, num))).flat(Infinity);
}
