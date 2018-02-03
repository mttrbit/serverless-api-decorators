export const wait = t => (res, rej) => (res, t) =>
  setTimeout(() => {
    res(true);
  }, t);

export const promisify = f => new Promise(f);

export const delay = time => new Promise(resolve => setTimeout(resolve, time));

export const until = (cond, time) =>
  cond().then(result => result || delay(time).then(() => until(cond, time)));

export const curry = fn => (...args) => fn.bind(null, ...args);

export const map = curry((fn, arr) => arr.map(fn));

export const reduce = x => curry((fn, arr) => arr.reduce(fn, x));

export const join = curry((str, arr) => arr.join(str));

export const tap = curry((fn, x) => {
  fn(x);
  return x;
});

export const trace = label => tap(x => console.log(`== ${label}: ${x}`));

export const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

/**
 * This method takes a reducer function and an initial value (`x`). We iterate over the array
 * functions (from right to left), applying each in turn to the accumulated value (`v`).
 */
export const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);
