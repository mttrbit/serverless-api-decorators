export const backbasify = o => {
  if (Array.isArray(o)) {
    let i = 0;
    return o.reduce((acc, val) => {
      acc[i] = backbasify(val);
      i += 1;
      return acc;
    }, {});
  } else if (Object.prototype.toString.call(o) === '[object Object]') {
    for (const k in o) {
      o[`${k}`] = backbasify(o[k]);
    }
  }

  return o;
};
